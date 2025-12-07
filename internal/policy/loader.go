package policy

import (
	"fmt"
	"io"
	"os"

	"gopkg.in/yaml.v3"
)

// Loader reads policy configuration from disk.
type Loader struct {
	Path string
}

// Load parses the YAML policy configuration.
func (l *Loader) Load() (*Config, error) {
	if l == nil {
		return nil, fmt.Errorf("policy loader is nil")
	}

	file, err := os.Open(l.Path)
	if err != nil {
		return nil, fmt.Errorf("open policy file: %w", err)
	}
	defer file.Close()

	return decodePolicy(file)
}

func decodePolicy(r io.Reader) (*Config, error) {
	var cfg Config
	decoder := yaml.NewDecoder(r)
	decoder.KnownFields(true)
	if err := decoder.Decode(&cfg); err != nil {
		return nil, fmt.Errorf("decode policy: %w", err)
	}
	return &cfg, nil
}
