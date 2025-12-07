package main

import (
    "log"
    "net/http"
)

// main bootstraps the HTTP API service. Handlers are stubbed for the initial skeleton.
func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        _, _ = w.Write([]byte("ok"))
    })

    log.Println("xlogin-api starting on :8080")
    if err := http.ListenAndServe(":8080", mux); err != nil {
        log.Fatalf("failed to start server: %v", err)
    }
}
