package policy

// Loader will eventually hot-reload policy configuration.
type Loader struct{}

func (l *Loader) Load() (*Config, error) {
    return &Config{}, nil
}
