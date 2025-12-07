package policy

// Engine evaluates claims and returns grants for providers.
type Engine struct{}

// Evaluate will implement policy decisions based on claims and request context.
func (e *Engine) Evaluate(claims any) ([]Grant, error) {
    return nil, nil
}
