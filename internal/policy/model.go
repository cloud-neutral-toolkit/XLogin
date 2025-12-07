package policy

// Grant represents an authorization decision for a specific provider.
type Grant struct {
    Provider string `yaml:"provider"`
    Account  string `yaml:"account,omitempty"`
    Role     string `yaml:"role,omitempty"`
    Project  string `yaml:"project,omitempty"`
    Subscription string `yaml:"subscription,omitempty"`
}

// Rule matches claims to grants.
type Rule struct {
    Name   string   `yaml:"name"`
    Match  Matchers `yaml:"match"`
    Grants []Grant  `yaml:"grants"`
}

// Matchers defines claim-based selectors.
type Matchers struct {
    Groups []string `yaml:"groups"`
    Env    []string `yaml:"env"`
}

// Config mirrors policy.yaml layout.
type Config struct {
    Rules []Rule `yaml:"rules"`
}
