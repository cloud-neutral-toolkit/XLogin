package providers

// ConsoleProvider returns a console URL for a provider.
type ConsoleProvider interface {
    ConsoleURL() (string, error)
}

// STSProvider exchanges a token for temporary credentials.
type STSProvider interface {
    Exchange() (any, error)
}
