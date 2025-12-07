#!/usr/bin/env bash
set -euo pipefail

echo "Generating default configs"
cp -v configs/issuers.yaml configs/issuers.generated.yaml
cp -v configs/policy.yaml configs/policy.generated.yaml
cp -v configs/providers.yaml configs/providers.generated.yaml
