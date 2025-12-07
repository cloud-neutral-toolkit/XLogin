package policy

import (
	"fmt"

	"github.com/example/xlogin/internal/oidc"
)

// Engine evaluates claims and returns grants for providers.
type Engine struct {
	cfg *Config
}

// NewEngine creates an Engine with the provided policy config.
func NewEngine(cfg *Config) *Engine {
	return &Engine{cfg: cfg}
}

// Evaluate determines whether the request is allowed and returns the resolved decision.
func (e *Engine) Evaluate(claims *oidc.XLoginClaims, provider string, target string, roleKey string) (*Decision, error) {
	if e == nil || e.cfg == nil {
		return nil, fmt.Errorf("policy engine not initialized")
	}

	for _, rule := range e.cfg.Rules {
		if !matchesCondition(rule.When, claims) {
			continue
		}

		if rule.Allow.Provider != provider {
			continue
		}

		if !targetAllowed(rule.Allow, target) {
			continue
		}

		resolvedRole, ok := resolveRole(rule.Allow.Roles, roleKey)
		if !ok {
			continue
		}

		return &Decision{
			RuleID:       rule.ID,
			Provider:     provider,
			Target:       target,
			RoleKey:      roleKey,
			ResolvedRole: resolvedRole,
		}, nil
	}

	return nil, fmt.Errorf("access not permitted for provider %q target %q role %q", provider, target, roleKey)
}

func matchesCondition(cond Condition, claims *oidc.XLoginClaims) bool {
	if claims == nil {
		return false
	}

	if len(cond.Groups) > 0 && !anyMatch(cond.Groups, claims.Groups) {
		return false
	}

	if len(cond.Env) > 0 && !stringMatch(cond.Env, claims.Env) {
		return false
	}

	if len(cond.Tenant) > 0 && !stringMatch(cond.Tenant, claims.Tenant) {
		return false
	}

	return true
}

func anyMatch(expected []string, actual []string) bool {
	if len(expected) == 0 {
		return true
	}

	actualSet := make(map[string]struct{}, len(actual))
	for _, v := range actual {
		actualSet[v] = struct{}{}
	}

	for _, v := range expected {
		if _, ok := actualSet[v]; ok {
			return true
		}
	}

	return false
}

func stringMatch(expected []string, value string) bool {
	for _, v := range expected {
		if v == value {
			return true
		}
	}
	return false
}

func targetAllowed(allow Allow, target string) bool {
	switch allow.Provider {
	case "aws":
		return valueAllowed(allow.Accounts, target)
	case "gcp":
		return valueAllowed(allow.Projects, target)
	case "azure":
		return valueAllowed(allow.Subscriptions, target)
	default:
		// fallback to wildcard if no explicit targets configured
		return valueAllowed(nil, target)
	}
}

func valueAllowed(allowed []string, target string) bool {
	if len(allowed) == 0 {
		return true // treat empty as wildcard
	}

	for _, v := range allowed {
		if v == "*" || v == target {
			return true
		}
	}
	return false
}

func resolveRole(roles []RoleMapping, roleKey string) (string, bool) {
	for _, role := range roles {
		if role.Key != roleKey {
			continue
		}

		switch {
		case role.IAMRoleName != "":
			return role.IAMRoleName, true
		case role.Role != "":
			return role.Role, true
		default:
			return "", true
		}
	}

	return "", false
}
