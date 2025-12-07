package util

import "log"

// Logger returns the standard logger placeholder.
func Logger() *log.Logger {
    return log.Default()
}
