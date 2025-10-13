;; title: Points System
;; version: 1.0.0
;; summary: On-chain points system for campaign rewards
;; description: A simple points system that tracks user points for campaign rewards

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u401))
(define-constant ERR_INVALID_AMOUNT (err u402))
(define-constant ERR_INVALID_MULTIPLIER (err u406))

;; data vars
(define-data-var total-points-issued uint u0)
(define-data-var global-multiplier uint u100) ;; 100 = 1.0x, 150 = 1.5x

;; data maps
(define-map user-points
  principal
  uint
)
;; user -> total points

(define-map authorized-issuers
  principal
  bool
)
;; who can issue points

(define-map user-achievements
  principal
  (list 20 uint)
)
;; user -> list of achievement IDs

;; Achievement definitions
(define-map achievements
  uint
  {
    name: (string-ascii 50),
    description: (string-ascii 200),
    points-required: uint,
  }
)

;; Initialize achievements
(map-set achievements u1 {
  name: "First Steps",
  description: "Earn your first points",
  points-required: u1,
})
(map-set achievements u2 {
  name: "Community Star",
  description: "Earn 500 points",
  points-required: u500,
})
(map-set achievements u3 {
  name: "Point Master",
  description: "Earn 1000 points",
  points-required: u1000,
})
(map-set achievements u4 {
  name: "Super Contributor",
  description: "Earn 5000 points",
  points-required: u5000,
})

;; Authorization management
(define-public (add-authorized-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (map-set authorized-issuers issuer true)
    (print {
      event: "issuer-authorized",
      issuer: issuer,
    })
    (ok true)
  )
)

(define-public (remove-authorized-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (map-delete authorized-issuers issuer)
    (print {
      event: "issuer-removed",
      issuer: issuer,
    })
    (ok true)
  )
)

;; Core points functions
(define-public (award-points
    (user principal)
    (points uint)
    (reason (string-utf8 256))
  )
  (let (
      (multiplier (var-get global-multiplier))
      (final-points (/ (* points multiplier) u100))
      (current-points (default-to u0 (map-get? user-points user)))
    )
    (begin
      (asserts!
        (or (is-eq tx-sender CONTRACT_OWNER) (default-to false (map-get? authorized-issuers tx-sender)))
        ERR_UNAUTHORIZED
      )
      (asserts! (> points u0) ERR_INVALID_AMOUNT)

      ;; Update user points
      (map-set user-points user (+ current-points final-points))

      ;; Update global stats
      (var-set total-points-issued (+ (var-get total-points-issued) final-points))

      ;; Check for achievements
      (unwrap-panic (check-and-award-achievements user))

      (print {
        event: "points-awarded",
        user: user,
        reason: reason,
        points: final-points,
        total-points: (+ current-points final-points),
      })

      (ok {
        points-earned: final-points,
        total-points: (+ current-points final-points),
      })
    )
  )
)

;; Multiplier management
(define-public (set-global-multiplier (multiplier uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_UNAUTHORIZED)
    (asserts! (and (>= multiplier u50) (<= multiplier u500))
      ERR_INVALID_MULTIPLIER
    )
    ;; 0.5x to 5.0x
    (var-set global-multiplier multiplier)
    (print {
      event: "multiplier-updated",
      multiplier: multiplier,
    })
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-user-points (user principal))
  (default-to u0 (map-get? user-points user))
)



(define-read-only (get-global-multiplier)
  (var-get global-multiplier)
)

(define-read-only (get-total-points-issued)
  (var-get total-points-issued)
)

(define-read-only (get-achievement (achievement-id uint))
  (map-get? achievements achievement-id)
)

(define-read-only (get-user-achievements (user principal))
  (default-to (list) (map-get? user-achievements user))
)

(define-read-only (is-authorized-issuer (issuer principal))
  (default-to false (map-get? authorized-issuers issuer))
)



;; Private functions
(define-private (check-and-award-achievements (user principal))
  (let (
      (user-total-points (get-user-points user))
      (current-achievements (get-user-achievements user))
    )
    (begin
      ;; Check First Steps achievement
      (if (and (>= user-total-points u1) (not (is-some (index-of current-achievements u1))))
        (map-set user-achievements user
          (unwrap-panic (as-max-len? (append current-achievements u1) u20))
        )
        true
      )

      ;; Check Community Star achievement
      (if (and (>= user-total-points u500) (not (is-some (index-of current-achievements u2))))
        (map-set user-achievements user
          (unwrap-panic (as-max-len? (append (get-user-achievements user) u2) u20))
        )
        true
      )

      ;; Check Point Master achievement
      (if (and (>= user-total-points u1000) (not (is-some (index-of current-achievements u3))))
        (map-set user-achievements user
          (unwrap-panic (as-max-len? (append (get-user-achievements user) u3) u20))
        )
        true
      )

      ;; Check Super Contributor achievement
      (if (and (>= user-total-points u5000) (not (is-some (index-of current-achievements u4))))
        (map-set user-achievements user
          (unwrap-panic (as-max-len? (append (get-user-achievements user) u4) u20))
        )
        true
      )

      (ok true)
    )
  )
)

;; Initialize contract owner as authorized issuer
(map-set authorized-issuers CONTRACT_OWNER true)
