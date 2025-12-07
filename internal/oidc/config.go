package oidc

// IssuerConfig maps issuer metadata to verification requirements.
type IssuerConfig struct {
	Name        string   `yaml:"name"`
	IssuerURL   string   `yaml:"issuerUrl"`
	ClientIDs   []string `yaml:"clientIds"`
	AllowedAlgs []string `yaml:"allowedAlgs"`
}

// Config represents the issuers.yaml layout.
type Config struct {
	Issuers []IssuerConfig `yaml:"issuers"`
}
