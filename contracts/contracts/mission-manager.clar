;; title: Mission Manager Contract
;; version: 1.0.0
;; summary: Mission management contract for token, STX, and points rewards
;; description: A contract that manages all missions with support for tokens, STX, points, or combinations

;; traits
(define-trait sip-010-trait (
    (transfer
        (uint principal principal (optional (buff 34)))
        (response bool uint)
    )
    (get-name
        ()
        (response (string-ascii 32) uint)
    )
    (get-symbol
        ()
        (response (string-ascii 32) uint)
    )
    (get-decimals
        ()
        (response uint uint)
    )
    (get-balance
        (principal)
        (response uint uint)
    )
    (get-total-supply
        ()
        (response uint uint)
    )
    (get-token-uri
        ()
        (response (optional (string-utf8 256)) uint)
    )
))

;; constants
(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_UNAUTHORIZED (err u100))
(define-constant ERR_INVALID_ADDRESS (err u101))
(define-constant ERR_CAMPAIGN_NOT_FOUND (err u104))
(define-constant ERR_INVALID_AMOUNT (err u105))

(define-constant ERR_INVALID_TIME_RANGE (err u107))
(define-constant ERR_TRANSFER_FAILED (err u108))
(define-constant ERR_TOKEN_NOT_ALLOWED (err u109))
(define-constant ERR_CAMPAIGN_FINALIZED (err u110))
(define-constant ERR_CAMPAIGN_NOT_ACTIVE (err u111))
(define-constant ERR_INSUFFICIENT_FUNDS (err u112))
(define-constant ERR_START_TIME_IN_PAST (err u113))
(define-constant ERR_CAMPAIGN_TOO_SHORT (err u114))

;; Mission must run for at least 7 days (assuming ~144 blocks per day)
(define-constant MIN_CAMPAIGN_DURATION u1008) ;; 7 days * 144 blocks/day

;; data vars
(define-data-var contract-owner principal CONTRACT_OWNER)
(define-data-var mission-count uint u0)
(define-data-var reward-distributor principal CONTRACT_OWNER)

;; data maps
(define-map missions
    uint ;; mission-id
    {
        creator: principal,
        start-time: uint,
        end-time: uint,
        total-points: uint,
        points-distributed: uint,
        is-finalized: bool,
        created-at: uint,
    }
)

;; Token/STX balance tracking per mission
(define-map mission-token-balances
    uint ;; mission-id
    {
        token-address: (optional principal), ;; none means STX
        token-amount: uint,
        amount-distributed: uint,
    }
)

;; Track allowed tokens with their contract references
(define-map allowed-tokens
    principal
    bool
)

;; Create mission with funding (supports tokens, STX, points, or combinations)
(define-public (create-mission
        (token (optional <sip-010-trait>))
        (token-amount uint)
        (total-points uint)
        (start-time uint)
        (end-time uint)
    )
    (let (
            (mission-id (+ (var-get mission-count) u1))
            (creator tx-sender)
            (token-address (match token
                some-token (some (contract-of some-token))
                none
            ))
        )
        (begin
            (asserts! (< start-time end-time) ERR_INVALID_TIME_RANGE)
            (asserts! (>= start-time stacks-block-height) ERR_START_TIME_IN_PAST)
            (asserts! (>= (- end-time start-time) MIN_CAMPAIGN_DURATION)
                ERR_CAMPAIGN_TOO_SHORT
            )
            (asserts! (or (> token-amount u0) (> total-points u0))
                ERR_INVALID_AMOUNT
            )

            ;; For point-only missions, ensure caller is contract owner
            (if (and (is-eq token-amount u0) (> total-points u0))
                (asserts! (is-eq tx-sender (var-get contract-owner))
                    ERR_UNAUTHORIZED
                )
                true
            )

            ;; For missions with tokens, assert total points equals total amount
            (if (> token-amount u0)
                (asserts! (is-eq total-points token-amount) ERR_INVALID_AMOUNT)
                true
            )

            ;; Handle funding if token-amount > 0
            (if (> token-amount u0)
                (match token
                    some-token
                    ;; Token mission: validate and transfer tokens
                    (begin
                        (asserts!
                            (default-to false
                                (map-get? allowed-tokens (contract-of some-token))
                            )
                            ERR_TOKEN_NOT_ALLOWED
                        )
                        (try! (contract-call? some-token transfer token-amount
                            tx-sender (as-contract tx-sender) none
                        ))
                    )
                    ;; STX mission: transfer STX
                    (try! (stx-transfer? token-amount tx-sender (as-contract tx-sender)))
                )
                ;; No funding needed
                true
            )

            ;; Store mission data
            (map-set missions mission-id {
                creator: creator,
                start-time: start-time,
                end-time: end-time,
                total-points: total-points,
                points-distributed: u0,
                is-finalized: false,
                created-at: stacks-block-height,
            })

            ;; Store token/STX balance info
            (map-set mission-token-balances mission-id {
                token-address: token-address,
                token-amount: token-amount,
                amount-distributed: u0,
            })

            (var-set mission-count mission-id)

            (print {
                event: "mission-created",
                mission-id: mission-id,
                creator: creator,
                token-address: token-address,
                token-amount: token-amount,
                total-points: total-points,
            })

            (ok mission-id)
        )
    )
)

;; Unified distribute rewards function (handles tokens, STX, points, or combinations)
(define-public (distribute-rewards
        (mission-id uint)
        (token (optional <sip-010-trait>))
        (distributions (list
            100
            {
                recipient: principal,
                amount: uint,
                points: uint,
            }
        ))
    )
    (let (
            (mission (unwrap! (map-get? missions mission-id) ERR_CAMPAIGN_NOT_FOUND))
            (token-balance (unwrap! (map-get? mission-token-balances mission-id)
                ERR_CAMPAIGN_NOT_FOUND
            ))
            (total-token-amount (fold sum-token-amounts distributions u0))
            (total-points-amount (fold sum-point-amounts distributions u0))
            (has-token-rewards (> total-token-amount u0))
            (has-points-rewards (> total-points-amount u0))
        )
        (begin
            (asserts! (is-eq tx-sender (var-get reward-distributor))
                ERR_UNAUTHORIZED
            )
            (asserts! (not (get is-finalized mission)) ERR_CAMPAIGN_FINALIZED)
            (asserts! (is-mission-active mission-id) ERR_CAMPAIGN_NOT_ACTIVE)
            (asserts! (or has-token-rewards has-points-rewards)
                ERR_INVALID_AMOUNT
            )

            ;; Validate sufficient funds for token/STX rewards
            (if has-token-rewards
                (asserts!
                    (<= total-token-amount
                        (- (get token-amount token-balance)
                            (get amount-distributed token-balance)
                        ))
                    ERR_INSUFFICIENT_FUNDS
                )
                true
            )

            ;; Validate sufficient points
            (if has-points-rewards
                (asserts!
                    (<= total-points-amount
                        (- (get total-points mission)
                            (get points-distributed mission)
                        ))
                    ERR_INSUFFICIENT_FUNDS
                )
                true
            )

            ;; Process all distributions (tokens/STX and points)
            (if has-token-rewards
                (begin
                    (try! (process-token-distributions mission-id token-balance token
                        distributions
                    ))
                    true
                )
                true
            )

            (if has-points-rewards
                (begin
                    (try! (process-points-distributions mission-id distributions))
                    true
                )
                true
            )

            ;; Update mission totals
            (if has-token-rewards
                (map-set mission-token-balances mission-id
                    (merge token-balance { amount-distributed: (+ (get amount-distributed token-balance) total-token-amount) })
                )
                true
            )

            (if has-points-rewards
                (map-set missions mission-id
                    (merge mission { points-distributed: (+ (get points-distributed mission) total-points-amount) })
                )
                true
            )

            (print {
                event: "rewards-distributed",
                mission-id: mission-id,
                total-token-amount: total-token-amount,
                total-points-amount: total-points-amount,
                recipient-count: (len distributions),
            })

            (ok true)
        )
    )
)

;; Finalize mission
(define-public (finalize-mission (mission-id uint))
    (let ((mission (unwrap! (map-get? missions mission-id) ERR_CAMPAIGN_NOT_FOUND)))
        (begin
            (asserts!
                (or
                    (is-eq tx-sender (get creator mission))
                    (is-eq tx-sender (var-get reward-distributor))
                )
                ERR_UNAUTHORIZED
            )
            (asserts! (not (get is-finalized mission)) ERR_CAMPAIGN_FINALIZED)

            ;; Update mission as finalized
            (map-set missions mission-id
                (merge mission { is-finalized: true })
            )

            (print {
                event: "mission-finalized",
                mission-id: mission-id,
                total-points-distributed: (get points-distributed mission),
            })

            (ok true)
        )
    )
)

;; Token allowlist management
(define-public (add-allowed-token (token-address principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (map-set allowed-tokens token-address true)
        (print {
            event: "token-added",
            token: token-address,
        })
        (ok true)
    )
)

(define-public (remove-allowed-token (token-address principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (map-delete allowed-tokens token-address)
        (print {
            event: "token-removed",
            token: token-address,
        })
        (ok true)
    )
)

;; Admin functions
(define-public (set-reward-distributor (distributor principal))
    (begin
        (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
        (asserts! (not (is-eq distributor 'SP000000000000000000002Q6VF78))
            ERR_INVALID_ADDRESS
        )
        (let ((old-distributor (var-get reward-distributor)))
            (var-set reward-distributor distributor)
            (print {
                event: "distributor-updated",
                old-distributor: old-distributor,
                new-distributor: distributor,
            })
            (ok true)
        )
    )
)

;; Emergency token/STX rescue
(define-public (rescue-funds
        (mission-id uint)
        (token (optional <sip-010-trait>))
        (recipient principal)
        (amount uint)
    )
    (let (
            (mission (unwrap! (map-get? missions mission-id) ERR_CAMPAIGN_NOT_FOUND))
            (token-balance (unwrap! (map-get? mission-token-balances mission-id)
                ERR_CAMPAIGN_NOT_FOUND
            ))
        )
        (begin
            (asserts! (is-eq tx-sender (var-get contract-owner)) ERR_UNAUTHORIZED)
            (asserts! (get is-finalized mission) ERR_CAMPAIGN_NOT_ACTIVE)

            (match token
                some-token
                ;; Rescue tokens
                (begin
                    (asserts!
                        (is-eq (get token-address token-balance)
                            (some (contract-of some-token))
                        )
                        ERR_INVALID_ADDRESS
                    )
                    (try! (as-contract (contract-call? some-token transfer amount tx-sender
                        recipient none
                    )))
                    (ok true)
                )
                ;; Rescue STX
                (begin
                    (asserts! (is-none (get token-address token-balance))
                        ERR_INVALID_ADDRESS
                    )
                    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
                    (ok true)
                )
            )
        )
    )
)

;; Read-only functions
(define-read-only (get-mission (mission-id uint))
    (map-get? missions mission-id)
)

(define-read-only (get-mission-token-balance (mission-id uint))
    (map-get? mission-token-balances mission-id)
)

(define-read-only (get-mission-count)
    (var-get mission-count)
)

(define-read-only (get-reward-distributor)
    (var-get reward-distributor)
)

(define-read-only (get-contract-owner)
    (var-get contract-owner)
)

(define-read-only (is-token-allowed (token-address principal))
    (default-to false (map-get? allowed-tokens token-address))
)

(define-read-only (is-mission-active (mission-id uint))
    (match (map-get? missions mission-id)
        mission (and
            (>= stacks-block-height (get start-time mission))
            (< stacks-block-height (get end-time mission))
            (not (get is-finalized mission))
        )
        false
    )
)

(define-read-only (get-mission-info (mission-id uint))
    (match (map-get? missions mission-id)
        mission (let ((token-balance (map-get? mission-token-balances mission-id)))
            (some {
                mission-id: mission-id,
                creator: (get creator mission),
                start-time: (get start-time mission),
                end-time: (get end-time mission),
                total-points: (get total-points mission),
                points-distributed: (get points-distributed mission),
                is-finalized: (get is-finalized mission),
                is-active: (is-mission-active mission-id),
                created-at: (get created-at mission),
                token-info: token-balance,
            })
        )
        none
    )
)

;; Get total points distributed across all missions
(define-read-only (get-total-points-distributed)
    (fold + (map get-mission-points-distributed (list-missions)) u0)
)

;; Get total token rewards distributed across all missions
(define-read-only (get-total-token-rewards-distributed)
    (fold + (map get-mission-token-distributed (list-missions)) u0)
)

;; Helper function to get points distributed for a single mission
(define-read-only (get-mission-points-distributed (mission-id uint))
    (match (map-get? missions mission-id)
        mission (get points-distributed mission)
        u0
    )
)

;; Helper function to get token amount distributed for a single mission
(define-read-only (get-mission-token-distributed (mission-id uint))
    (match (map-get? mission-token-balances mission-id)
        token-balance (get amount-distributed token-balance)
        u0
    )
)

;; Helper function to list all mission IDs (up to mission count)
(define-read-only (list-missions)
    (map +
        (list
            u1             u2             u3             u4             u5
            u6             u7             u8             u9             u10
            u11             u12             u13             u14             u15
            u16             u17             u18             u19
            u20
        )
        (list u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0 u0)
    )
)

;; Get mission statistics
(define-read-only (get-mission-stats)
    {
        total-missions: (var-get mission-count),
        total-points-distributed: (get-total-points-distributed),
        total-token-rewards-distributed: (get-total-token-rewards-distributed),
    }
)

;; Private helper functions
(define-private (sum-token-amounts
        (distribution {
            recipient: principal,
            amount: uint,
            points: uint,
        })
        (acc uint)
    )
    (+ acc (get amount distribution))
)

(define-private (sum-point-amounts
        (distribution {
            recipient: principal,
            amount: uint,
            points: uint,
        })
        (acc uint)
    )
    (+ acc (get points distribution))
)

;; Process token/STX distributions
(define-private (process-token-distributions
        (mission-id uint)
        (token-balance {
            token-address: (optional principal),
            token-amount: uint,
            amount-distributed: uint,
        })
        (token (optional <sip-010-trait>))
        (distributions (list
            100
            {
                recipient: principal,
                amount: uint,
                points: uint,
            }
        ))
    )
    (fold process-single-token-distribution distributions (ok { token: token }))
)

(define-private (process-single-token-distribution
        (distribution {
            recipient: principal,
            amount: uint,
            points: uint,
        })
        (previous-result (response { token: (optional <sip-010-trait>) } uint))
    )
    (match previous-result
        success-data (let (
                (recipient (get recipient distribution))
                (token-amount (get amount distribution))
                (token (get token success-data))
            )
            (begin
                ;; Only process if there's a token amount
                (if (> token-amount u0)
                    (begin
                        ;; Transfer tokens/STX
                        (match token
                            some-token
                            ;; Token transfer - use provided token contract
                            (try! (as-contract (contract-call? some-token transfer token-amount
                                tx-sender recipient none
                            )))
                            ;; STX transfer
                            (try! (as-contract (stx-transfer? token-amount tx-sender recipient)))
                        )
                        (ok success-data)
                    )
                    (ok success-data)
                )
            )
        )
        error (err error)
    )
)

;; Process points distributions by calling the points contract
(define-private (process-points-distributions
        (mission-id uint)
        (distributions (list
            100
            {
                recipient: principal,
                amount: uint,
                points: uint,
            }
        ))
    )
    (fold process-single-points-distribution distributions (ok true))
)

(define-private (process-single-points-distribution
        (distribution {
            recipient: principal,
            amount: uint,
            points: uint,
        })
        (previous-result (response bool uint))
    )
    (match previous-result
        success-data (let (
                (recipient (get recipient distribution))
                (points-amount (get points distribution))
            )
            (begin
                ;; Only process if there are points to award
                (if (> points-amount u0)
                    (begin
                        ;; Award points through the points contract
                        (try! (contract-call? .points award-points recipient
                            points-amount u"Mission reward"
                        ))
                        (ok true)
                    )
                    (ok true)
                )
            )
        )
        error (err error)
    )
)
