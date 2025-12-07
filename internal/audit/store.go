package audit

// Store represents a pluggable sink for audit records.
type Store interface {
    Write(record any) error
}
