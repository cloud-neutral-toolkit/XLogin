package http

import "net/http"

// RegisterRoutes wires HTTP routes. Implementation will be expanded in later iterations.
func RegisterRoutes(mux *http.ServeMux) {
    mux.HandleFunc("/api/console-url", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusNotImplemented)
    })
    mux.HandleFunc("/api/sts", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusNotImplemented)
    })
}
