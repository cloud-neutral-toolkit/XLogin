package oidc

import (
	"context"
	"errors"
	"fmt"

	gooidc "github.com/coreos/go-oidc/v3/oidc"
	"github.com/golang-jwt/jwt/v5"
)

// Verifier validates JWTs from configured issuers using JWKS discovery.
type Verifier struct {
	issuers   map[string]IssuerConfig
	verifiers map[string]*gooidc.IDTokenVerifier
}

// NewVerifier constructs a verifier for all configured issuers.
func NewVerifier(ctx context.Context, cfg *Config) (*Verifier, error) {
	if cfg == nil {
		return nil, errors.New("nil OIDC config")
	}

	issuers := make(map[string]IssuerConfig)
	verifiers := make(map[string]*gooidc.IDTokenVerifier)

	for _, issuer := range cfg.Issuers {
		if issuer.IssuerURL == "" {
			return nil, fmt.Errorf("issuer %q missing issuerUrl", issuer.Name)
		}

		provider, err := gooidc.NewProvider(ctx, issuer.IssuerURL)
		if err != nil {
			return nil, fmt.Errorf("discover OIDC provider for %q: %w", issuer.IssuerURL, err)
		}

		verifier := provider.Verifier(&gooidc.Config{
			SkipClientIDCheck:    true,
			SupportedSigningAlgs: issuer.AllowedAlgs,
		})

		issuers[issuer.IssuerURL] = issuer
		verifiers[issuer.IssuerURL] = verifier
	}

	return &Verifier{
		issuers:   issuers,
		verifiers: verifiers,
	}, nil
}

// Verify validates the provided raw JWT and returns structured claims and the issuer configuration used.
func (v *Verifier) Verify(ctx context.Context, rawToken string) (*XLoginClaims, *IssuerConfig, error) {
	if v == nil {
		return nil, nil, errors.New("verifier is nil")
	}

	iss, err := extractIssuer(rawToken)
	if err != nil {
		return nil, nil, err
	}

	issuerCfg, ok := v.issuers[iss]
	if !ok {
		return nil, nil, fmt.Errorf("issuer %q not configured", iss)
	}

	verifier, ok := v.verifiers[iss]
	if !ok {
		return nil, nil, fmt.Errorf("verifier for issuer %q unavailable", iss)
	}

	idToken, err := verifier.Verify(ctx, rawToken)
	if err != nil {
		return nil, &issuerCfg, fmt.Errorf("verify token: %w", err)
	}

	if !audienceAllowed(idToken.Audience, issuerCfg.ClientIDs) {
		return nil, &issuerCfg, fmt.Errorf("audience %v not allowed for issuer %q", idToken.Audience, issuerCfg.Name)
	}

	var claims XLoginClaims
	if err := idToken.Claims(&claims); err != nil {
		return nil, &issuerCfg, fmt.Errorf("decode claims: %w", err)
	}

	claims.RawToken = rawToken
	return &claims, &issuerCfg, nil
}

func extractIssuer(rawToken string) (string, error) {
	token, _, err := jwt.NewParser().ParseUnverified(rawToken, jwt.MapClaims{})
	if err != nil {
		return "", fmt.Errorf("parse token header: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("unexpected claims format")
	}

	issVal, ok := claims["iss"].(string)
	if !ok || issVal == "" {
		return "", errors.New("issuer claim missing")
	}

	return issVal, nil
}

func audienceAllowed(tokenAudiences []string, allowed []string) bool {
	if len(allowed) == 0 {
		return false
	}

	allowedSet := make(map[string]struct{}, len(allowed))
	for _, aud := range allowed {
		allowedSet[aud] = struct{}{}
	}

	for _, aud := range tokenAudiences {
		if _, ok := allowedSet[aud]; ok {
			return true
		}
	}

	return false
}
