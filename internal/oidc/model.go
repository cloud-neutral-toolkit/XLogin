package oidc

import "github.com/golang-jwt/jwt/v5"

// XLoginClaims describes the expected claims in validated tokens.
type XLoginClaims struct {
	Sub    string   `json:"sub"`
	Email  string   `json:"email,omitempty"`
	Groups []string `json:"groups,omitempty"`
	Tenant string   `json:"tenant,omitempty"`
	Env    string   `json:"env,omitempty"`
	Scope  string   `json:"scope,omitempty"`

	RawToken string `json:"-"` // raw JWT for downstream STS/Federation flows
	jwt.RegisteredClaims
}
