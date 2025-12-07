#!/usr/bin/env bash
set -euo pipefail

echo "Starting xlogin-api on :8080"
(cd cmd/xlogin-api && go run . >/tmp/xlogin-api.log 2>&1 &)

echo "Starting xlogin web on :3000"
(cd web && npm run dev >/tmp/xlogin-web.log 2>&1 &)

echo "Logs: /tmp/xlogin-api.log and /tmp/xlogin-web.log"
