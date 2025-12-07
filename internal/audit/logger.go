package audit

import "log"

// Logger wraps structured logging for audit events.
type Logger struct{}

// Info logs informational audit messages.
func (l *Logger) Info(msg string) {
    log.Printf("audit info: %s", msg)
}
