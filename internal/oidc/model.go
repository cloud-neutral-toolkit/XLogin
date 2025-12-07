package oidc

// XLoginClaims describes the expected claims in validated tokens.
type XLoginClaims struct {
    Subject string   `json:"sub"`
    Issuer  string   `json:"iss"`
    Audience string  `json:"aud"`
    Groups  []string `json:"groups"`
    Tenant  string   `json:"tenant"`
    Env     string   `json:"env"`
}
