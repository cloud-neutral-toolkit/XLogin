package policy

// RoleMapping maps a logical role key to a provider-specific role name.
type RoleMapping struct {
	Key         string `yaml:"key"`
	IAMRoleName string `yaml:"iamRoleName,omitempty"`
	Role        string `yaml:"role,omitempty"`
}

// Allow defines provider-specific access that can be granted when a rule matches.
type Allow struct {
	Provider      string        `yaml:"provider"`
	Accounts      []string      `yaml:"accounts,omitempty"`
	Projects      []string      `yaml:"projects,omitempty"`
	Subscriptions []string      `yaml:"subscriptions,omitempty"`
	Roles         []RoleMapping `yaml:"roles"`
}

// Condition describes the required claims for a rule to match.
type Condition struct {
	Groups []string `yaml:"groups,omitempty"`
	Env    []string `yaml:"env,omitempty"`
	Tenant []string `yaml:"tenant,omitempty"`
}

// Rule maps matching conditions to allowed provider access.
type Rule struct {
	ID    string    `yaml:"id"`
	When  Condition `yaml:"when"`
	Allow Allow     `yaml:"allow"`
}

// Config mirrors policy.yaml layout.
type Config struct {
	Rules []Rule `yaml:"rules"`
}

// Decision captures the resolved access for a request.
type Decision struct {
	RuleID       string
	Provider     string
	Target       string
	RoleKey      string
	ResolvedRole string
}
