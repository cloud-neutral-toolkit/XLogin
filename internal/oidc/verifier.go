package oidc

// Verifier validates JWTs from configured issuers.
type Verifier struct{}

// Verify will be implemented to perform JWKS-based validation.
func (v *Verifier) Verify(token string) error {
    return nil
}
