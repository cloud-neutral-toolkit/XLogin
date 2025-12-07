package oidc

// IssuerConfig maps issuer metadata to verification requirements.
type IssuerConfig struct {
    Name     string `yaml:"name"`
    Issuer   string `yaml:"issuer"`
    Audience string `yaml:"audience"`
    JWKSURL  string `yaml:"jwks_url"`
}

// Config represents the issuers.yaml layout.
type Config struct {
    Issuers []IssuerConfig `yaml:"issuers"`
}
