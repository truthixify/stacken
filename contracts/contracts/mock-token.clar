;; Mock SIP-010 Token for Testing
(define-fungible-token mock-token)

(define-constant CONTRACT_OWNER tx-sender)

(define-public (transfer (amount uint) (sender principal) (recipient principal) (memo (optional (buff 34))))
  (ft-transfer? mock-token amount sender recipient)
)

(define-read-only (get-name)
  (ok "Mock Token")
)

(define-read-only (get-symbol)
  (ok "MOCK")
)

(define-read-only (get-decimals)
  (ok u6)
)

(define-read-only (get-balance (who principal))
  (ok (ft-get-balance mock-token who))
)

(define-read-only (get-total-supply)
  (ok (ft-get-supply mock-token))
)

(define-read-only (get-token-uri)
  (ok none)
)

;; Mint function for testing
(define-public (mint (amount uint) (recipient principal))
  (ft-mint? mock-token amount recipient)
)