# StockEase – Final Project Report

> **University DevOps Capstone Project**  
> Version: 1.0 | November 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Overview](#2-project-overview)
3. [Team Contributions](#3-team-contributions)
4. [System Architecture](#4-system-architecture)
5. [Application Design](#5-application-design)
6. [Phase 1 — Repository Initialization and GitHub Setup](#6-phase-1--repository-initialization-and-github-setup)
7. [Phase 2 — Full-Stack Application Development](#7-phase-2--full-stack-application-development)
8. [Phase 3 — Docker and Docker Compose Containerization](#8-phase-3--docker-and-docker-compose-containerization)
9. [Phase 4 — GitHub Actions CI/CD Pipeline](#9-phase-4--github-actions-cicd-pipeline)
10. [Phase 5 — Kubernetes Orchestration](#10-phase-5--kubernetes-orchestration)
11. [Phase 6 — Ansible Infrastructure Automation](#11-phase-6--ansible-infrastructure-automation)
12. [Phase 7 — Monitoring and Security Scanning](#12-phase-7--monitoring-and-security-scanning)
13. [Phase 8 — Final Documentation and Project Completion](#13-phase-8--final-documentation-and-project-completion)
14. [Challenges and Solutions](#14-challenges-and-solutions)
15. [Technology Stack Summary](#15-technology-stack-summary)
16. [Security Practices](#16-security-practices)
17. [DevOps Maturity Assessment](#17-devops-maturity-assessment)
18. [Outcomes and Learning](#18-outcomes-and-learning)
19. [Conclusion](#19-conclusion)

---

## 1. Executive Summary

StockEase is a university DevOps Capstone Project demonstrating the progressive application of industry-standard DevOps practices to a full-stack inventory management web application. The project spans eight phases, beginning with source code management and concluding with comprehensive documentation, monitoring, and automated security scanning.

The application allows administrators to manage product inventories — adding, updating, deleting, and querying products — with real-time stock level visibility and low-stock alerts. The system is built with React, Node.js, Express, and MongoDB, and has been containerized, orchestrated, and automated using Docker, Kubernetes, Ansible, and GitHub Actions.

**Final Status: All eight phases implemented, tested, documented, and merged. ✅**

---

## 2. Project Overview

| Field | Details |
|-------|---------|
| **Project Title** | StockEase – Inventory Management System |
| **Type** | University DevOps Capstone Project |
| **Repository** | https://github.com/Yashmalik2004/StockEase |
| **Primary Branch** | `main` |
| **Number of Phases** | 8 |
| **Status** | Complete |
| **Completion Date** | November 2026 |

### Problem Statement

Small and medium-sized businesses frequently rely on manual or spreadsheet-based inventory tracking. This approach is error-prone, fails to scale, and provides no real-time visibility into stock levels. The resulting problems include:

- **Overstocking** — excess capital tied up in unused inventory.
- **Stockouts** — lost sales and customer dissatisfaction.
- **Poor visibility** — no consolidated view of product categories or quantities.
- **Inefficiency** — manual processes that consume disproportionate time and resources.

StockEase addresses these problems with a centralized, digital, and automated inventory management system built and deployed using modern DevOps principles.

---

## 3. Team Contributions

| Team Member | Primary Phases | Role |
|-------------|---------------|------|
| **Yash Malik** (@Yashmalik2004) | Phase 1, 2, 3, 6, 8 | Project Lead, Backend & DevOps Engineer |
| **Sneha Sharma** | Phase 4, 5 | CI/CD and Kubernetes Engineer |
| **Vansh Soni** | Phase 2, 3 | Frontend Developer |
| **Shrishti Pathak** | Phase 7 | Monitoring and Security Engineer |
| **Amit Sharma** | Phase 2, 5 | Backend Developer, Kubernetes Support |

All team members collaborated on design decisions, code review, and documentation across all phases.

---

## 4. System Architecture

### High-Level Architecture

```
Browser (Admin User)
  │
  ▼
Nginx (port 80)
  ├── Static files  → React SPA (Vite build)
  └── /api/*        → Proxy → Express REST API (port 5000)
                              │
                              ├── MongoDB (port 27017) — data persistence
                              └── /metrics → Prometheus (port 9090) — observability
```

### Deployment Targets

| Target | Description |
|--------|-------------|
| **Local Development** | Vite dev server + Express + local MongoDB |
| **Docker Compose** | 4-service stack: mongodb, backend, frontend, prometheus |
| **Kubernetes (Minikube)** | Namespace `stockease`; PVC for MongoDB; NodePort services |
| **Ansible** | Automated Kubernetes deployment from WSL2 (35-task playbook) |

---

## 5. Application Design

### Frontend (React + Vite + Tailwind CSS)

The frontend is a Single-Page Application (SPA) built with React 18 and Vite 5. Tailwind CSS 3 provides utility-first styling. The application features:

- Collapsible sidebar navigation
- Dashboard with key inventory statistics and recent activity
- Product management table with search, category filter, and pagination
- Inline stock quantity increment/decrement controls
- Low-stock visual indicators (In Stock / Low Stock / Out of Stock)
- Authentication forms (register, login) with JWT token storage

For production deployment, the React SPA is compiled to a static bundle and served by Nginx. Nginx also acts as a reverse proxy, forwarding `/api/*` requests to the backend Express server — eliminating CORS issues in containerized environments.

### Backend (Node.js + Express)

The backend exposes a RESTful API with the following routes:

| Method | Route | Auth | Description |
|--------|-------|:----:|-------------|
| `POST` | `/api/auth/register` | ❌ | Admin account creation |
| `POST` | `/api/auth/login` | ❌ | Returns JWT token |
| `GET` | `/api/products` | ✅ | List all products (paginated) |
| `POST` | `/api/products` | ✅ | Create a new product |
| `GET` | `/api/products/:id` | ✅ | Get single product |
| `PUT` | `/api/products/:id` | ✅ | Update product |
| `DELETE` | `/api/products/:id` | ✅ | Delete product |
| `GET` | `/api/dashboard/stats` | ✅ | Aggregate inventory statistics |
| `GET` | `/api/health` | ❌ | Health check endpoint |
| `GET` | `/metrics` | ❌ | Prometheus metrics |

Authentication uses JSON Web Tokens (JWT). Tokens are validated by an Express middleware on all protected routes.

### Database (MongoDB + Mongoose)

MongoDB stores two collections:

- **admins** — email (unique), bcrypt-hashed password, createdAt
- **products** — name, SKU (unique), category, quantity, price, threshold, createdAt, updatedAt

Mongoose provides schema validation and ORM-style query helpers.

---

## 6. Phase 1 — Repository Initialization and GitHub Setup

**Branch:** `main` (initial setup)  
**Status:** ✅ Complete

Phase 1 established the project foundation:

- Created the GitHub repository at `github.com/Yashmalik2004/StockEase`.
- Configured `.gitignore` to exclude `node_modules/`, `.env`, build outputs, OS files, and IDE configuration.
- Established the branching strategy: `main` as the stable integration branch; feature branches (`phase-N-name`) for development; pull requests for merges.
- Created the initial project scaffolding (`backend/`, `frontend/`, `docs/`, `database/`).
- Wrote the initial `README.md` with project description and roadmap.

---

## 7. Phase 2 — Full-Stack Application Development

**Branch:** `full-stack-development` → merged to `main`  
**Status:** ✅ Complete

Phase 2 implemented the complete application:

- **Backend:** Express server with JWT authentication, product CRUD endpoints, dashboard aggregate, and health check.
- **Frontend:** React SPA with Vite, Tailwind CSS, React Router, and Axios. All pages and components implemented.
- **Database:** MongoDB with Mongoose schemas for `Admin` and `Product` models.
- **Local validation:** Application tested end-to-end in local development mode.

A `database/seed.js` script provides sample data for development and demonstration purposes.

---

## 8. Phase 3 — Docker and Docker Compose Containerization

**Branch:** `docker-containerization` → merged to `main`  
**Status:** ✅ Complete

Phase 3 containerized the application for portable, reproducible deployments:

- **Backend Dockerfile:** Multi-stage build — `node:20-alpine` base, production dependencies only, non-root user.
- **Frontend Dockerfile:** Multi-stage build — Node.js build stage produces static bundle; Nginx Alpine serves it.
- **`frontend/nginx.conf`:** Configured to serve `index.html` for all SPA routes and proxy `/api/*` to the backend container.
- **`docker-compose.yml`:** Defines 4 services (`mongodb`, `backend`, `frontend`, `prometheus`) on a shared `stockease-network` bridge.
- **`.env.example`:** Template for all environment variables required by Docker Compose.
- **Runtime verification:** All 4 containers started and verified with `docker compose up -d`.

---

## 9. Phase 4 — GitHub Actions CI/CD Pipeline

**Branch:** `github-actions-cicd` → merged to `main`  
**Status:** ✅ Complete

Phase 4 automated build, test, and container validation:

**`.github/workflows/ci.yml`** — 3 jobs:

| Job | Steps | Trigger |
|-----|-------|---------|
| `backend-ci` | `npm ci`, `npm test` | Push / PR to main |
| `frontend-ci` | `npm ci`, `npm run build` | Push / PR to main |
| `docker-ci` | Docker Buildx, build images, Trivy scan | After backend-ci + frontend-ci |

The pipeline runs on every push to `main` or the `github-actions-cicd` branch, and on pull requests targeting `main`. Failures block merges, ensuring the `main` branch is always deployable.

---

## 10. Phase 5 — Kubernetes Orchestration

**Branch:** `kubernetes-deployment` → merged to `main`  
**Status:** ✅ Complete

Phase 5 deployed StockEase to a Kubernetes cluster (Minikube with Docker driver):

**Manifests (`kubernetes/`):**

| File | Resource | Description |
|------|----------|-------------|
| `namespace.yaml` | Namespace | `stockease` namespace |
| `configmap.yaml` | ConfigMap | `MONGO_URI`, `FRONTEND_URL`, `NODE_ENV` |
| `secret.yaml.example` | Secret (template) | `JWT_SECRET` base64 placeholder |
| `mongodb-pvc.yaml` | PersistentVolumeClaim | 1Gi MongoDB data volume |
| `mongodb-deployment.yaml` | Deployment | `mongo:7.0`, 1 replica |
| `mongodb-service.yaml` | Service | ClusterIP:27017 |
| `backend-deployment.yaml` | Deployment | `stockease-backend:latest`, 1 replica |
| `backend-service.yaml` | Service | ClusterIP:5000 |
| `frontend-deployment.yaml` | Deployment | `stockease-frontend:latest`, 1 replica |
| `frontend-service.yaml` | Service | NodePort:30080 |

Images were built locally and loaded into Minikube's Docker daemon. All pods reached `Running` state and functional validation was performed against the NodePort frontend URL.

---

## 11. Phase 6 — Ansible Infrastructure Automation

**Branch:** `ansible-automation` → merged to `main`  
**Status:** ✅ Complete

Phase 6 automated the Kubernetes deployment with Ansible, targeting the local Minikube cluster from WSL2.

**Directory structure:**

```
ansible/
├── ansible.cfg
├── requirements.yml
├── README.md
├── inventory/
│   └── hosts.ini          (localhost connection)
├── group_vars/
│   └── all.yml            (variable definitions)
└── playbooks/
    ├── deploy.yml         (35 tasks)
    └── validate.yml       (22 tasks)
```

**Key implementation details:**

- `deploy.yml` applies all Kubernetes manifests in dependency order: namespace → ConfigMap → Secret → MongoDB (PVC + Deployment + Service) → Backend → Frontend.
- **JWT secret idempotency:** The JWT secret is read from `~/.stockease/jwt_secret` (outside the repository) and stored in the Kubernetes Secret using the `data:` field (base64-encoded), not `stringData:`. This prevents Kubernetes from reporting a change on every apply, achieving true idempotency.
- `validate.yml` verifies pod health, service endpoints, and application responsiveness.
- `no_log: true` is applied to all tasks involving the secret value.

**Idempotency result:**
- First run: `ok=35 changed=8 failed=0`
- Subsequent runs: `ok=35 changed=0 failed=0`

---

## 12. Phase 7 — Monitoring and Security Scanning

**Branch:** `monitoring-security` → merged to `main`  
**Status:** ✅ Complete

Phase 7 added observability and automated security scanning:

### Prometheus Monitoring

- **Backend integration:** `prom-client` (v15.1.3) added to the Express backend, exposing a `GET /metrics` endpoint.
- **Custom metrics:**
  - `stockease_http_requests_total` (Counter) — requests by method, route, status
  - `stockease_http_request_duration_seconds` (Histogram) — latency with 9 buckets
  - `stockease_active_requests` (Gauge) — concurrent active requests
  - Default Node.js runtime metrics (heap, event loop, CPU)
- **Prometheus server:** `prom/prometheus:v2.51.2` added to `docker-compose.yml` and `monitoring/kubernetes/`.
- **Alert rules:** 4 rules — `BackendDown`, `HighErrorRate`, `HighLatency`, `HighMemoryUsage`.
- **Scrape configuration:** Backend scraped every 10 seconds.

### Trivy Security Scanning

- **GitHub Actions:** `.github/workflows/security-scan.yml` with 3 parallel jobs scanning the backend image, frontend image, and repository filesystem/secrets.
- **Local scripts:** `monitoring/security/trivy-scan.sh` (Linux/macOS) and `monitoring/security/trivy-scan.ps1` (Windows).
- **Triggers:** Push to main, PRs, weekly schedule (Monday 02:00 UTC), manual dispatch.
- **SARIF reports:** Uploaded to the GitHub Security tab for each scan.
- **Suppression:** `monitoring/security/.trivyignore` documents accepted CVEs.

---

## 13. Phase 8 — Final Documentation and Project Completion

**Branch:** `final-documentation`  
**Status:** ✅ Complete

Phase 8 consolidated all eight phases into a coherent, submission-ready repository:

- Updated `README.md` with status badges, completed roadmap, team section.
- Created `docs/PHASE_8_COMPLETION_REPORT.md` (this phase report).
- Created `docs/FINAL_PROJECT_REPORT.md` (this document).
- Created `docs/ARCHITECTURE.md` with Mermaid diagrams for all 8 architecture layers.
- Created `docs/SETUP_AND_EXECUTION.md` with complete developer setup instructions.
- Verified all 8 phase completion reports are present in `docs/`.
- Confirmed no secrets are committed to the repository.
- Confirmed `~/.stockease/jwt_secret` is outside the repository.

---

## 14. Challenges and Solutions

| Challenge | Phase | Solution |
|-----------|-------|----------|
| `EADDRINUSE: address already in use :::5000` | 2, 3 | Identify and kill the conflicting process using `netstat`/`taskkill` (Windows) or `lsof`/`kill` (Linux) |
| Docker Compose CORS issue in Nginx proxy | 3 | Configured Nginx `proxy_pass` to the backend service; set `FRONTEND_URL` for backend CORS allowlist |
| GitHub Actions `package-lock.json` out of sync | 4 | Regenerated `package-lock.json` after adding `prom-client`; committed it to the repository |
| `stringData` Kubernetes Secret idempotency | 6 | Switched Secret `stringData:` to `data:` with pre-encoded base64 value; Ansible no longer reports spurious changes on each run |
| WSL2 `git index.lock` permission error on Windows | 6, 8 | Ran all Git operations via `wsl bash -c "..."` with bypass sandbox to avoid Windows file locking conflicts |
| WSL2 git empty ident name | 6 | Set `git config user.name` and `git config user.email` within the WSL2 clone before committing |
| Minikube cluster unavailable after laptop restart | 6 | Re-ran `minikube start --driver=docker`; images were already cached; playbook re-applied cleanly |
| Ansible `kubectl` not found in WSL2 PATH | 6 | Installed `kubectl` via `snap install kubectl --classic` in WSL2 |
| Prometheus `prom-client` missing in Docker build | 7 | Added `prom-client` to `backend/package.json` and regenerated `package-lock.json` before Docker build |
| PowerShell does not support `&&` command chaining | Throughout | Used semicolons or separate `run_command` calls instead of `&&` for multi-step Windows PowerShell commands |
| README.md read as binary on Windows (CRLF) | 8 | Used `Get-Content README.md -Encoding UTF8` via PowerShell instead of direct file read |

---

## 15. Technology Stack Summary

### Application

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | 18 |
| Frontend Build | Vite | 5 |
| Frontend Styling | Tailwind CSS | 3 |
| Frontend Server | Nginx | Alpine |
| Backend Runtime | Node.js | 20 LTS |
| Backend Framework | Express | 4 |
| Database | MongoDB | 7.0 |
| ORM | Mongoose | 8 |
| Authentication | JSON Web Tokens (JWT) | — |
| Metrics | prom-client | 15.1.3 |

### DevOps

| Tool | Technology | Version |
|------|-----------|---------|
| Version Control | Git + GitHub | ≥ 2.40 |
| Containerization | Docker + Docker Compose | ≥ 24 / ≥ 2.20 |
| CI/CD | GitHub Actions | — |
| Container Orchestration | Kubernetes (Minikube) | ≥ 1.28 |
| Infrastructure Automation | Ansible | ≥ 8 |
| Monitoring | Prometheus | v2.51.2 |
| Security Scanning | Trivy | ≥ 0.49 |

---

## 16. Security Practices

The following security practices were applied throughout the project:

| Practice | Implementation |
|----------|---------------|
| **Secret management** | Secrets stored in `.env` (not committed); Kubernetes Secret from base64-encoded file outside repository; `no_log: true` in Ansible tasks |
| **JWT authentication** | All product and dashboard API routes require a valid JWT; tokens signed with `HS256` and expire after `7d` |
| **Password hashing** | Admin passwords hashed with `bcryptjs` (salt rounds: 10) before storage |
| **Non-root containers** | Backend Dockerfile creates and runs as a non-root `node` user |
| **Multi-stage Docker builds** | Only production dependencies included in final images; dev dependencies excluded |
| **Automated CVE scanning** | Trivy scans all images and repository files on every push to main and weekly |
| **SARIF reporting** | Trivy results uploaded to GitHub Security tab for visibility and tracking |
| **`.gitignore` hygiene** | `.env`, `node_modules/`, build outputs, IDE config, and OS files excluded from commits |

---

## 17. DevOps Maturity Assessment

| Dimension | Level | Evidence |
|-----------|-------|---------|
| **Source Control** | Optimised | Branching strategy; pull request workflow; clean commit history |
| **Build Automation** | Optimised | Automated builds in GitHub Actions on every push |
| **Testing** | Managed | Backend unit tests run in CI; linting on frontend |
| **Containerization** | Optimised | Multi-stage Docker builds; Compose for local; images loaded into Minikube |
| **Orchestration** | Managed | Full Kubernetes deployment; PVC for data persistence; NodePort exposure |
| **Configuration Management** | Optimised | Ansible 35-task idempotent playbook; group_vars; external secret management |
| **CI/CD** | Optimised | Automatic build, test, Docker build, Trivy scan on every commit |
| **Monitoring** | Managed | Prometheus metrics with custom counters, histograms, gauges; alert rules configured |
| **Security** | Managed | Automated CVE scanning; SARIF reports; non-root containers; secret hygiene |
| **Documentation** | Optimised | Phase reports, architecture diagrams, setup guide, final project report |

---

## 18. Outcomes and Learning

### Technical Outcomes

1. **Portable deployments:** A single `docker compose up -d` command starts the full 4-service stack from scratch on any machine with Docker Desktop.
2. **Reproducible infrastructure:** `ansible-playbook deploy.yml` deploys the application to Kubernetes idempotently — first run deploys, subsequent runs confirm state without changes.
3. **Automated quality gate:** GitHub Actions prevents broken code from reaching `main` by running tests and container builds automatically on every push.
4. **Continuous security visibility:** Trivy scans run weekly and on every push; results surface in GitHub Security without manual intervention.
5. **Operational observability:** Prometheus metrics expose request rates, latency, error rates, and resource consumption in real-time.

### Learning Outcomes

- **Docker multi-stage builds** reduce final image size and attack surface by excluding build tools and dev dependencies.
- **Kubernetes Secret idempotency** requires using `data:` with pre-encoded base64 values rather than `stringData:` to prevent unnecessary updates.
- **Ansible idempotency** is not guaranteed by default — care is required when using shell commands or non-idempotent modules; `kubectl apply` is naturally idempotent.
- **Prometheus instrumentation** in Node.js is straightforward with `prom-client` but requires the dependency to be present in the production Docker image, not just in dev.
- **WSL2–Windows interop** introduces file locking edge cases (`.git/index.lock`) that require running Git operations from within the WSL2 environment.

---

## 19. Conclusion

StockEase successfully demonstrates the application of eight progressive DevOps disciplines to a full-stack web application, moving from raw source code to a fully automated, monitored, and security-scanned system.

The project met all eight phase objectives:

1. ✅ Repository initialized with clean branching strategy and `.gitignore`
2. ✅ Full-stack application developed with React, Express, and MongoDB
3. ✅ Application containerized with multi-stage Docker builds and Compose orchestration
4. ✅ CI/CD pipeline automates build, test, and container validation
5. ✅ Kubernetes manifests deploy the application to Minikube with persistent storage
6. ✅ Ansible automates the full Kubernetes deployment idempotently
7. ✅ Prometheus provides real-time metrics; Trivy scans for CVEs automatically
8. ✅ Comprehensive documentation prepared for university submission

The repository is clean, all secrets are excluded from version control, CI is passing, and all eight phase reports are available in `docs/`.

**Final Verdict: StockEase DevOps Capstone Project — COMPLETE ✅**

---

*Report prepared by the StockEase Project Team — November 2026*
