# GitHub Actions Workflows

This directory contains all **GitHub Actions** CI/CD workflow YAML files for automating the build, test, and validation pipeline of StockEase.

## Implemented Workflows (Phase 4)

| Workflow File | Trigger | Purpose |
|---|---|---|
| `ci.yml` | Push / PR to `main`; Push to `github-actions-cicd` | Backend syntax validation, frontend lint + build, Docker image builds |

## CI Pipeline Overview

```
Code Push / Pull Request
        │
        ├─── Backend CI ──────────────────────────────────────────────┐
        │     • Install Node.js 20 + npm ci (production deps)         │
        │     • node --check on all backend JS files                   │
        │                                                              ├──► Docker CI
        └─── Frontend CI ─────────────────────────────────────────────┘
              • Install Node.js 20 + npm ci (all deps)                │
              • ESLint (npm run lint)                                  │
              • Production build (npm run build / vite build)         │
                                                                       │
                                        Docker CI ◄────────────────────
                                          • docker compose config
                                          • docker compose build backend
                                          • docker compose build frontend
```

## Job Dependencies

```
backend-ci  ─┐
              ├──► docker-ci
frontend-ci ─┘
```

`docker-ci` only runs if both `backend-ci` and `frontend-ci` pass.

## Workflow Triggers

| Event | Branch | Jobs triggered |
|---|---|---|
| `push` | `main` | All jobs |
| `push` | `github-actions-cicd` | All jobs |
| `pull_request` | targeting `main` | All jobs |

## Status

> ✅ **Implemented in Phase 4.**
> GitHub Actions CI/CD pipeline is active on the `github-actions-cicd` feature branch.

## Planned Workflows (Future Phases)

| Workflow File | Phase | Purpose |
|---|---|---|
| `security-scan.yml` | Phase 7 | Trivy vulnerability scan |
