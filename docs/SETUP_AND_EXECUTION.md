# StockEase – Setup and Execution Guide

> **University DevOps Capstone Project**  
> Version: Final (Phase 8) | November 2026

This guide covers every method to run StockEase — from local development through Docker Compose, Kubernetes on Minikube, and Ansible-automated deployment — along with monitoring and security scanning.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clone the Repository](#2-clone-the-repository)
3. [Environment Variables Reference](#3-environment-variables-reference)
4. [Local Development](#4-local-development)
5. [Docker Compose](#5-docker-compose)
6. [Kubernetes (Minikube)](#6-kubernetes-minikube)
7. [Ansible Automated Deployment](#7-ansible-automated-deployment)
8. [Prometheus Monitoring](#8-prometheus-monitoring)
9. [Trivy Security Scanning](#9-trivy-security-scanning)
10. [GitHub Actions CI/CD](#10-github-actions-cicd)

---

## 1. Prerequisites

| Tool | Version | Purpose | Install |
|------|---------|---------|---------|
| **Node.js** | ≥ 20 LTS | Backend + Frontend dev | [nodejs.org](https://nodejs.org) |
| **npm** | ≥ 10 | Package management | Included with Node.js |
| **Git** | ≥ 2.40 | Version control | [git-scm.com](https://git-scm.com) |
| **Docker Desktop** | ≥ 24 | Containers | [docker.com](https://www.docker.com) |
| **Docker Compose** | ≥ 2.20 | Multi-container | Included with Docker Desktop |
| **kubectl** | ≥ 1.28 | Kubernetes CLI | [kubernetes.io](https://kubernetes.io/docs/tasks/tools/) |
| **Minikube** | ≥ 1.32 | Local Kubernetes | [minikube.sigs.k8s.io](https://minikube.sigs.k8s.io) |
| **WSL2** (Windows) | Ubuntu 22.04+ | Ansible runtime | [Microsoft Docs](https://learn.microsoft.com/en-us/windows/wsl/) |
| **Ansible** | ≥ 8 (in WSL2) | Infrastructure automation | `pip3 install ansible` |
| **Trivy** | ≥ 0.49 | Security scanning | [aquasecurity.github.io/trivy](https://aquasecurity.github.io/trivy) |
| **MongoDB** | 7.0 | Database (local dev only) | [mongodb.com](https://www.mongodb.com) or Docker |

> **Windows Users:** Ansible must be run inside WSL2. All Ansible commands in this guide assume a WSL2 terminal.

---

## 2. Clone the Repository

```bash
git clone https://github.com/Yashmalik2004/StockEase.git
cd StockEase
```

Confirm you are on `main`:

```bash
git branch --show-current
# main
```

---

## 3. Environment Variables Reference

### Root `.env` (Docker Compose)

Copy the template:

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET`:

| Variable | Default / Example | Description |
|----------|------------------|-------------|
| `JWT_SECRET` | *(set your own)* | Secret used to sign JWT tokens — keep private |
| `MONGO_INITDB_DATABASE` | `stockease` | MongoDB initial database name |
| `BACKEND_PORT` | `5001` | Host port mapped to backend container |
| `FRONTEND_PORT` | `3000` | Host port mapped to frontend container |
| `VITE_API_URL` | `http://localhost:5001` | Frontend API base URL (build-time) |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry |

> **Never commit `.env` to Git.** It is listed in `.gitignore`.

### Backend `.env` (Local Development)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` to set `MONGO_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL`.

---

## 4. Local Development

This mode runs the backend and frontend as separate processes with hot-reload. MongoDB must be available (local install or Docker).

### 4.1 Start MongoDB (via Docker, optional)

```bash
docker run -d --name mongo-dev -p 27017:27017 mongo:7.0
```

### 4.2 Start the Backend

```bash
cd backend
npm install
# Ensure backend/.env is configured
npm run dev
# Backend available at http://localhost:5000
```

### 4.3 Start the Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
# Frontend available at http://localhost:5173
```

### 4.4 Access the Application

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- Metrics: [http://localhost:5000/metrics](http://localhost:5000/metrics)

---

## 5. Docker Compose

This mode runs all services in containers: MongoDB, backend (Express), frontend (Nginx + React build), and Prometheus.

### 5.1 Configure Environment

```bash
cp .env.example .env
# Edit .env — set JWT_SECRET to a strong random value
```

### 5.2 Build and Start

```bash
docker compose up -d --build
```

### 5.3 Verify Services

```bash
docker compose ps
docker compose logs backend
```

### 5.4 Access

| Service | URL |
|---------|-----|
| Frontend (React) | [http://localhost:3000](http://localhost:3000) |
| Backend API | [http://localhost:5001/api](http://localhost:5001/api) |
| Health check | [http://localhost:5001/api/health](http://localhost:5001/api/health) |
| Metrics endpoint | [http://localhost:5001/metrics](http://localhost:5001/metrics) |
| Prometheus UI | [http://localhost:9090](http://localhost:9090) |

### 5.5 Stop

```bash
docker compose down
# To also remove volumes (deletes MongoDB data):
docker compose down -v
```

---

## 6. Kubernetes (Minikube)

### 6.1 Start Minikube

```bash
minikube start --driver=docker
minikube status
```

### 6.2 Build Docker Images Inside Minikube

> This loads images directly into Minikube's Docker daemon, avoiding a registry.

```bash
# Windows PowerShell — set Minikube Docker env
minikube -p minikube docker-env | Invoke-Expression

# Build images
docker build -t stockease-backend:latest ./backend
docker build -t stockease-frontend:latest ./frontend
```

Or use `minikube image load` after building locally:

```bash
docker build -t stockease-backend:latest ./backend
docker build -t stockease-frontend:latest ./frontend
minikube image load stockease-backend:latest
minikube image load stockease-frontend:latest
```

### 6.3 Create the JWT Secret

```bash
# Generate and base64-encode a JWT secret
kubectl create namespace stockease
kubectl create secret generic stockease-secret \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)" \
  -n stockease
```

Or apply the example and edit:

```bash
cp kubernetes/secret.yaml.example kubernetes/secret.yaml
# Edit kubernetes/secret.yaml — replace placeholder with base64-encoded value
kubectl apply -f kubernetes/secret.yaml
```

> **Do not commit `kubernetes/secret.yaml`** — it is in `.gitignore`.

### 6.4 Apply All Manifests

```bash
kubectl apply -f kubernetes/
```

### 6.5 Verify Deployment

```bash
kubectl get pods -n stockease
kubectl get services -n stockease
kubectl rollout status deployment/backend -n stockease
kubectl rollout status deployment/frontend -n stockease
```

### 6.6 Access

```bash
# Frontend
minikube service frontend -n stockease

# Prometheus (if monitoring manifests applied)
kubectl apply -f monitoring/kubernetes/
minikube service prometheus -n stockease
```

Or use port-forwarding:

```bash
kubectl port-forward svc/frontend 8080:80 -n stockease
kubectl port-forward svc/prometheus 9090:9090 -n stockease
```

### 6.7 Teardown

```bash
kubectl delete namespace stockease
```

---

## 7. Ansible Automated Deployment

> Ansible must be run from **WSL2**. The playbook targets the local Minikube cluster via `kubectl`.

### 7.1 Prerequisites (WSL2)

```bash
# In WSL2:
pip3 install ansible
ansible --version
# Confirm kubectl is accessible:
kubectl get nodes
```

### 7.2 Generate a Persistent JWT Secret

```bash
# In WSL2 — run ONCE per environment
mkdir -p ~/.stockease
openssl rand -hex 32 > ~/.stockease/jwt_secret
chmod 600 ~/.stockease/jwt_secret
```

> This file is outside the repository and is never committed.

### 7.3 Set Ansible Configuration

```bash
export ANSIBLE_CONFIG=/mnt/c/Users/YASH/Desktop/projects/StockEase/ansible/ansible.cfg
cd /mnt/c/Users/YASH/Desktop/projects/StockEase
```

### 7.4 Run the Deployment Playbook

```bash
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/deploy.yml
```

Expected result:
```
PLAY RECAP
localhost : ok=35  changed=N  failed=0  unreachable=0  skipped=0
```

On subsequent runs (idempotency):
```
localhost : ok=35  changed=0  failed=0  unreachable=0  skipped=0
```

### 7.5 Run the Validation Playbook

```bash
ansible-playbook -i ansible/inventory/hosts.ini ansible/playbooks/validate.yml
```

### 7.6 Syntax Check

```bash
ansible-playbook -i ansible/inventory/hosts.ini --syntax-check ansible/playbooks/deploy.yml
ansible-playbook -i ansible/inventory/hosts.ini --syntax-check ansible/playbooks/validate.yml
```

---

## 8. Prometheus Monitoring

### 8.1 Docker Compose

Prometheus is included in `docker-compose.yml` and starts automatically:

```bash
docker compose up -d
# Access: http://localhost:9090
```

Useful PromQL queries:

```promql
# Request rate by route
rate(stockease_http_requests_total[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(stockease_http_request_duration_seconds_bucket[5m]))

# Active requests gauge
stockease_active_requests

# Backend up/down
up{job="stockease-backend"}

# Heap memory (MB)
stockease_nodejs_heap_size_used_bytes / 1024 / 1024
```

### 8.2 Kubernetes

```bash
kubectl apply -f monitoring/kubernetes/
kubectl rollout status deployment/prometheus -n stockease
minikube service prometheus -n stockease
```

### 8.3 Direct Metrics Endpoint

```bash
# Docker Compose
curl http://localhost:5001/metrics

# Kubernetes (port-forward)
kubectl port-forward svc/backend 5000:5000 -n stockease
curl http://localhost:5000/metrics
```

---

## 9. Trivy Security Scanning

### 9.1 GitHub Actions (Automatic)

Security scans run automatically on:
- Push to `main` or `monitoring-security`
- Pull requests targeting `main`
- Weekly schedule (Monday 02:00 UTC)
- Manual dispatch from the **Actions** tab

Results are uploaded to the **Security** tab of the GitHub repository as SARIF reports.

### 9.2 Local Scan (Linux / macOS / WSL2)

Requires Trivy and Docker installed.

```bash
# All scans
./monitoring/security/trivy-scan.sh all

# Individual scans
./monitoring/security/trivy-scan.sh backend    # Backend image
./monitoring/security/trivy-scan.sh frontend   # Frontend image
./monitoring/security/trivy-scan.sh filesystem # Repository files + secret detection
```

### 9.3 Local Scan (Windows PowerShell)

```powershell
# All scans
.\monitoring\security\trivy-scan.ps1 -ScanType all

# Individual scans
.\monitoring\security\trivy-scan.ps1 -ScanType backend
.\monitoring\security\trivy-scan.ps1 -ScanType frontend
.\monitoring\security\trivy-scan.ps1 -ScanType filesystem
```

### 9.4 Suppression

Accepted CVEs are listed in `monitoring/security/.trivyignore` with inline justification comments.

---

## 10. GitHub Actions CI/CD

The repository has two workflow files:

| Workflow | File | Triggers |
|----------|------|---------|
| **CI Pipeline** | `.github/workflows/ci.yml` | Push to `main` or `github-actions-cicd`; PRs to `main` |
| **Security Scan** | `.github/workflows/security-scan.yml` | Push to `main` or `monitoring-security`; PRs; weekly; manual |

### CI Pipeline Jobs

```
backend-ci     → npm ci + npm test + lint
frontend-ci    → npm ci + npm run build + lint
docker-ci      → Buildx build (backend + frontend images) + Trivy image scan
  (needs: backend-ci AND frontend-ci)
```

### View Results

Navigate to: `https://github.com/Yashmalik2004/StockEase/actions`

Security scan SARIF results: `https://github.com/Yashmalik2004/StockEase/security/code-scanning`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `EADDRINUSE: address already in use :::5000` | Kill the process: `npx kill-port 5000` or `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| `minikube start` fails on Windows | Ensure Docker Desktop is running and WSL2 integration is enabled |
| Backend pod `CrashLoopBackOff` | Check logs: `kubectl logs -l app=backend -n stockease`; verify Secret and ConfigMap exist |
| Ansible `kubectl not found` | Install kubectl in WSL2: `sudo snap install kubectl --classic` |
| `git index.lock` permission error on Windows | Run git commands via WSL2: `wsl bash -c "cd /mnt/c/... && git ..."` |
| Trivy `connection refused` | Ensure Docker is running before executing local scan scripts |

---

*Setup guide prepared by the StockEase Project Team — November 2026*
