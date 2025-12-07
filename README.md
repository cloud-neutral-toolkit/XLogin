# XLogin

XLogin is a multi-cloud OIDC access portal that treats external identity providers as the single source of truth for humans and machines. The project consolidates JWT verification, policy evaluation, and cloud-specific federation flows so that cloud IAM services only issue temporary credentials or console URLs.

## Architecture
- **OIDC Verifier:** Validates JWTs from multiple issuers with JWKS caching and aud/exp checks.
- **Policy Engine:** Maps claims (groups/tenant/env) to provider/account/role permissions.
- **Providers Router:** Dispatches authorization results to AWS, GCP, Azure, and Alibaba Cloud provider integrations.
- **Audit:** Centralized structured logging for access and federation actions.

```mermaid
flowchart TD
    A[User / Service] --> B[auth.svc.plus IdP\n(Zitadel / Keycloak / OIDC SaaS)]
    B -- OIDC JWT (sub, groups, tenant, env, scope...) --> C[XLogin Portal]

    subgraph XLogin
        C --> C1[OIDC Verifier\n- Multi Issuer\n- JWKS Cache\n- aud/exp Checks]
        C1 --> C2[Policy Engine\n- group/tenant/env to permissions\n- Provider/Account/Role decisions]
        C2 --> C3[Providers Router]
        C3 --> D1[AWS Provider]
        C3 --> D2[GCP Provider]
        C3 --> D3[Azure Provider]
        C3 --> D4[AliCloud Provider]
        C3 --> C4[Audit Logger]
    end

    D1 --> E1[AWS STS / Federation\nConsole URL & STS creds]
    D2 --> E2[GCP Workforce/Workload Federation\nConsole URL & Token]
    D3 --> E3[Azure Entra + portal.azure.com\nPortal URL & Token]
    D4 --> E4[AliCloud STS + RAM OIDC SSO\nConsole SSO URL & STS creds]
```

## Project Structure
```
xlogin/
  README.md
  LICENSE
  .github/
    workflows/
      ci.yml                # lint + test + build
  configs/
    issuers.yaml            # OIDC Issuer list
    policy.yaml             # Multi-cloud access policy
    providers.yaml          # Cloud provider config

  cmd/
    xlogin-api/
      main.go               # Go HTTP API service
    xlogin-worker/          # Optional background worker

  internal/
    http/
      router.go             # Route registration
      handlers.go           # /api/console-url /api/sts handlers
      middleware.go         # Auth / Logging / Recovery
    oidc/
      verifier.go           # Multi-issuer OIDC validation with JWKS cache
      model.go              # XLoginClaims definition
      config.go             # issuers.yaml loading
    policy/
      engine.go             # Authorization decisions
      model.go              # Policy DSL
      loader.go             # policy.yaml hot reload
    providers/
      provider.go           # ConsoleProvider & STSProvider interfaces
      aws/
        console.go          # JWT → STS → Console URL
        sts.go              # JWT → STS temporary credentials
      gcp/
        console.go          # Workforce federated console URL
        sts.go              # Optional STS / access token
      azure/
        console.go          # portal.azure.com URL
        sts.go              # Optional workload identity
      alicloud/
        console.go          # RAM OIDC SSO entry URL
        sts.go              # AssumeRoleWithOIDC → STS
    audit/
      logger.go             # Structured logs
      store.go              # Pluggable sink
    config/
      config.go             # Global configuration loading
    util/
      log.go
      errors.go

  web/                      # Next.js App Router frontend
    package.json
    next.config.mjs
    app/
      layout.tsx
      page.tsx              # Dashboard
      api/                  # Optional Next API routes
      (login)/callback/     # OIDC callback handler
    src/
      components/
      lib/
      hooks/

  example/
    IAC/
      aws-xlogin-oidc.tf    # AWS OIDC Provider + Role
      gcp-workforce.tf
      azure-federation.tf
      alicloud-ram-oidc.tf
    gitops/
      k8s/
        kustomization.yaml
        deployment.yaml     # Deploy xlogin-api & web
        configmap.yaml      # Mount configs/*.yaml
    ansible-playbook/
      deploy-xlogin.yaml    # One-click VM deployment
      roles/
        xlogin/
          tasks/
          templates/

  scripts/
    dev.sh                  # Local dev helper
    gen-config.sh           # Generate default configs
```

## Getting Started
1. Update `configs/issuers.yaml`, `policy.yaml`, and `providers.yaml` with your IdP and cloud mappings.
2. Run `scripts/dev.sh` to start local services (API + web placeholders).
3. Use `deploy/docker-compose/docker-compose.yaml` for quick local orchestration or the Helm chart in `deploy/chart` for Kubernetes.

## Status
Initial skeleton with stubs for Go API, Next.js frontend, CI workflow, Docker-based GitHub Action, and deployment assets.
