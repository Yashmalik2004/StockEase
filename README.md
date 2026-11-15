# StockEase – Inventory Management System

> **University DevOps Capstone Project**

---

## 📌 Project Information

| Field | Details |
|-------|---------|
| **Project Title** | StockEase |
| **Category** | Inventory Management System |
| **Type** | University DevOps Capstone Project |
| **Repository** | [github.com/Yashmalik2004/StockEase](https://github.com/Yashmalik2004/StockEase) |

---

## 📖 Project Description

**StockEase** is a full-stack web-based Inventory Management System designed to help businesses efficiently track, manage, and control their product stock. The application provides an intuitive admin interface for managing product catalogues, monitoring stock levels in real-time, and receiving automatic low-stock alerts — all through a modern, responsive web UI.

Beyond the application itself, StockEase serves as a comprehensive DevOps Capstone Project, demonstrating the progressive application of industry-standard DevOps practices including containerization, orchestration, CI/CD automation, infrastructure management, and system monitoring.

---

## ❗ Problem Statement

Small and medium-sized businesses frequently struggle with manual or spreadsheet-based inventory tracking, which is error-prone, difficult to scale, and lacks real-time visibility. This leads to:

- **Overstocking**, tying up capital in excess inventory.
- **Stockouts**, causing lost sales and customer dissatisfaction.
- **Lack of visibility** into stock levels across product categories.
- **Inefficient manual processes** consuming valuable time.

StockEase addresses these problems by providing a centralized, digital, and automated inventory management solution — built and deployed following modern DevOps principles.

---

## 🎯 Project Objectives

1. Develop a fully functional web-based inventory management system.
2. Apply modern DevOps methodologies throughout the software development lifecycle.
3. Containerize the application using Docker for consistent, portable deployments.
4. Orchestrate containers using Kubernetes for scalability and resilience.
5. Automate CI/CD pipelines using GitHub Actions.
6. Automate server provisioning and configuration using Ansible.
7. Implement application monitoring using Prometheus.
8. Perform container image security scanning using Trivy.
9. Maintain clean version control practices using Git and GitHub.
10. Produce comprehensive documentation for all phases of development.

---

## 🚀 Implemented Application Features

| # | Feature | Status | Description |
|---|---------|:------:|-------------|
| 1 | **Admin Registration** | ✅ Complete | Secure administrator account creation |
| 2 | **Admin Login** | ✅ Complete | Email and password authentication |
| 3 | **JWT Authentication** | ✅ Complete | Stateless token-based route protection |
| 4 | **Add Products** | ✅ Complete | Form to register items with SKU and categories |
| 5 | **View Products** | ✅ Complete | Paginated product catalogue table |
| 6 | **Update Product Information** | ✅ Complete | Edit item metadata, price, and thresholds |
| 7 | **Delete Products** | ✅ Complete | Removal with safety confirmation prompt |
| 8 | **Manage Stock Quantities** | ✅ Complete | Dynamic stock increment and decrement |
| 9 | **Search Products** | ✅ Complete | Instant name-based product filtering |
| 10 | **Filter by Category** | ✅ Complete | Category dropdown selector |
| 11 | **Low-Stock Alerts** | ✅ Complete | Visual threshold indicators (In Stock, Low Stock, Out of Stock) |
| 12 | **Dashboard Statistics** | ✅ Complete | Key metric summary cards and recent activity list |
| 13 | **Responsive Admin UI** | ✅ Complete | Collapsible sidebar layout built with Tailwind CSS |

---

## 🛠️ Technology Stack

### Application Layer (Implemented)

| Layer | Technology | Status | Purpose |
|-------|-----------|:------:|---------|
| **Frontend** | React.js 18 + Vite 5 + Tailwind CSS 3 | ✅ Complete | Modern, responsive admin single-page application |
| **Backend** | Node.js + Express.js 4 | ✅ Complete | RESTful API server with centralized routing |
| **Database** | MongoDB + Mongoose 8 | ✅ Complete | NoSQL document storage with schema validation |

### DevOps Layer (Roadmap)

| Tool | Technology | Status | Purpose |
|------|-----------|:------:|---------|
| **Version Control** | Git + GitHub | ✅ Complete (Phase 1) | Source code management and collaboration |
| **Containerization** | Docker + Docker Compose | ✅ Complete (Phase 3) | Multi-stage image build, Nginx reverse proxy, and multi-container orchestration |
| **CI/CD** | GitHub Actions | ✅ Complete (Phase 4) | Automated build, test, and container scanning |
| **Orchestration** | Kubernetes | ✅ Complete (Phase 5) | Cluster deployment, scaling, and self-healing |
| **Automation** | Ansible | ✅ Complete (Phase 6) | Automated Kubernetes deployment orchestration |
| **Monitoring** | Prometheus | ⏳ Planned (Phase 7) | Real-time metric collection and monitoring |
| **Security Scanning** | Trivy | ⏳ Planned (Phase 7) | Container image vulnerability analysis |

---

## 🐳 Running StockEase with Docker Compose

StockEase is fully containerized and runs as a multi-container architecture orchestrated through Docker Compose.

### Architecture & Service Communication

```
                      ┌───────────────────────────────────────┐
                      │             Client Browser            │
                      └──────────────────┬────────────────────┘
                                         │
                         HTTP Port 3000  │  (Frontend UI & /api reverse proxy)
                                         ▼
                      ┌───────────────────────────────────────┐
                      │          stockease-frontend           │
                      │             (Nginx Alpine)            │
                      └──────────────────┬────────────────────┘
                                         │
                 Internal Docker Network │  http://backend:5000/api
                                         ▼
                      ┌───────────────────────────────────────┐
                      │           stockease-backend           │
                      │         (Node.js 20 Express)          │
                      └──────────────────┬────────────────────┘
                                         │
                 Internal Docker Network │  mongodb://mongodb:27017
                                         ▼
                      ┌───────────────────────────────────────┐
                      │           stockease-mongodb           │
                      │              (Mongo 7.0)              │
                      └──────────────────┬────────────────────┘
                                         │
                                         ▼
                             Persistent Docker Volume
                              (stockease-mongodb-data)
```

- **Frontend (`stockease-frontend`)**: Multi-stage build (Node.js 20 builds React bundle, Nginx Alpine serves static files on port 80, mapped to host port `3000`). Nginx acts as a reverse proxy forwarding `/api` calls internally to the backend.
- **Backend (`stockease-backend`)**: Node.js 20 LTS container running the Express API on port `5000`. Connects internally to the database using `mongodb://mongodb:27017/stockease`. Awaits database readiness via Docker Compose healthchecks.
- **Database (`stockease-mongodb`)**: Official MongoDB 7.0 image with a built-in healthcheck (`mongosh --eval db.adminCommand('ping')`) and persistent data storage mounted to `stockease-mongodb-data`.

---

### Step-by-Step Instructions

#### 1. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Git](https://git-scm.com/) installed.

#### 2. Clone the Repository
```bash
git clone https://github.com/Yashmalik2004/StockEase.git
cd StockEase
```

#### 3. Configure Environment Variables
Copy the root environment template:
```bash
cp .env.example .env
```
Adjust variables if necessary (the defaults work out of the box for Docker Compose).

#### 4. Build and Start All Containers
To build the images and launch all three services in detached (background) mode with a single command:
```bash
docker compose up --build -d
```
*(Or omit `-d` to see real-time combined logs in your terminal).*

#### 5. Access the Frontend
Open your browser and navigate to:
```
http://localhost:3000
```
- Click **Register** to create an initial administrator account.
- Sign in to access the product catalog and inventory dashboard.

#### 6. Access the Backend Health Endpoint
Verify the backend is live and healthy (Docker backend is mapped to host port **5001** to avoid conflict with local dev):
```bash
curl http://localhost:5001/api/health
```
Expected response:
```json
{"status":"ok","message":"StockEase API is running."}
```

#### 7. Inspect Running Containers
Check the status and health of all containers:
```bash
docker compose ps
```
You should see `stockease-frontend` (healthy/running), `stockease-backend` (running), and `stockease-mongodb` (healthy).

#### 8. View Container Logs
View live logs for all services:
```bash
docker compose logs -f
```
Or view logs for a specific service:
```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

#### 9. Stop the Application
Pause/stop all services without removing containers:
```bash
docker compose stop
```
To restart them later:
```bash
docker compose start
```

#### 10. Stop and Remove Containers (Preserving Database Data)
To tear down the containers and network while **safely preserving** your MongoDB data in the persistent volume:
```bash
docker compose down
```
When you run `docker compose up -d` next time, all your registered products and admin accounts remain intact.

#### 11. Complete Reset (Remove Containers and Database Volume)
When you intentionally want to delete all stored database data and reset the entire environment from scratch:
```bash
docker compose down -v
```

---

## 💻 Alternative: Running StockEase Locally (Non-Docker)

If you prefer to run services manually on your host machine without Docker:

### Prerequisites
- Node.js 18+
- Local MongoDB running on port 27017

### 1. Configure and Start Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Backend API starts on `http://localhost:5000`

### 2. Configure and Start Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
Frontend UI starts on `http://localhost:5173`

### 3. (Optional) Populate Sample Inventory
```bash
cd backend
npm run seed
```

---

## 📁 Repository Structure

```
StockEase/
│
├── frontend/           # React.js + Vite frontend application
│   ├── src/            # Source code (pages, components, API client)
│   ├── Dockerfile      # Multi-stage production build (Node build -> Nginx serve)
│   ├── nginx.conf      # Nginx web server config with /api reverse proxy
│   └── .dockerignore   # Excludes node_modules, dist, logs from build context
│
├── backend/            # Node.js + Express.js API server
│   ├── config/         # Database connection configuration
│   ├── controllers/    # API endpoint handlers
│   ├── middleware/     # JWT authentication middleware
│   ├── models/         # Mongoose models (Admin, Product)
│   ├── Dockerfile      # Production Node.js container build
│   └── .dockerignore   # Excludes node_modules, .env from build context
│
├── database/           # MongoDB schema documentation + seed script
├── docker/             # Docker architecture documentation
├── docker-compose.yml  # Multi-container orchestration specification
├── docs/               # Phase completion reports
├── .env.example        # Root environment template for Docker Compose
├── .gitignore
└── README.md
```

---

## 🗺️ Development Roadmap

| Phase | Title | Status |
|-------|-------|:------:|
| **Phase 1** | Project Initialization and GitHub Setup | ✅ Complete |
| **Phase 2** | Frontend, Backend and MongoDB Development | ✅ Complete |
| **Phase 3** | Docker and Docker Compose Containerization | ✅ Complete |
| **Phase 4** | GitHub Actions CI/CD Pipeline | ✅ Complete |
| **Phase 5** | Kubernetes Deployment | ✅ Complete |
| **Phase 6** | Ansible Automation | ✅ Complete |
| **Phase 7** | Monitoring and Security | ⏳ Planned |
| **Phase 8** | Testing, Documentation and Final Demonstration | ⏳ Planned |

---

## 📄 License

This project is developed for academic purposes as part of a university DevOps Capstone Project.

---

## 👨‍💻 Author

**Yash Malik**  
GitHub: [@Yashmalik2004](https://github.com/Yashmalik2004)

---

## Phase 7: Monitoring and Security ? Complete

### Overview
Phase 7 adds Prometheus-based monitoring and Trivy-based security scanning to StockEase.

### Prometheus Monitoring
- **Backend metrics**: `GET /metrics` endpoint (prom-client `^15.1.3`) exposing custom HTTP counters, histograms, gauges, and default Node.js runtime metrics
- **Prometheus server**: `prom/prometheus:v2.51.2`, scrapes backend every 10 seconds
- **Kubernetes**: Deployed in `stockease` namespace, accessible at **NodePort 30090**
- **Docker Compose**: Available at `http://localhost:9090`

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `stockease_http_requests_total` | Counter | Total HTTP requests by method, route, status code |
| `stockease_http_request_duration_seconds` | Histogram | Request duration with 9 latency buckets |
| `stockease_active_requests` | Gauge | Instantaneous active request count |
| `stockease_nodejs_heap_size_used_bytes` | Gauge | Node.js heap memory in use |
| `stockease_nodejs_eventloop_lag_seconds` | Histogram | Event loop lag |
| `stockease_process_cpu_seconds_total` | Counter | CPU time consumed |

### Security Scanning (Trivy)
- **GitHub Actions**: `.github/workflows/security-scan.yml` � 3 parallel jobs scan backend image, frontend image, and filesystem/config/secrets
- **Local scripts**: `monitoring/security/trivy-scan.sh` (Linux/Mac) and `monitoring/security/trivy-scan.ps1` (Windows)
- **Triggers**: Push to `main`/`monitoring-security`, PRs to `main`, weekly schedule (Monday 02:00 UTC), manual dispatch
- **SARIF reports**: Uploaded to GitHub Security tab for each scan

### Quick Start

#### Access Prometheus (Docker Compose)
```bash
docker compose up -d
# Open http://localhost:9090
# Test metrics directly:
curl http://localhost:5001/metrics
```

#### Access Prometheus (Kubernetes)
```bash
kubectl apply -f monitoring/kubernetes/
kubectl rollout status deployment/prometheus -n stockease
minikube service prometheus -n stockease
# Or: kubectl port-forward svc/prometheus 9090:9090 -n stockease
```

#### Run Security Scan Locally
```bash
# Linux/Mac (requires trivy + docker)
./monitoring/security/trivy-scan.sh all

# Windows (requires trivy + docker)
.\monitoring\security\trivy-scan.ps1 -ScanType all
```

### Useful PromQL Queries
```promql
rate(stockease_http_requests_total[5m])
histogram_quantile(0.95, rate(stockease_http_request_duration_seconds_bucket[5m]))
stockease_active_requests
up{job="stockease-backend"}
stockease_nodejs_heap_size_used_bytes / 1024 / 1024
```

### New Files Added in Phase 7
```
monitoring/
+-- prometheus/
�   +-- prometheus.yml          # Prometheus scrape configuration
�   +-- alert_rules.yml         # 4 alert rules (BackendDown, HighErrorRate, etc.)
+-- kubernetes/
�   +-- prometheus-configmap.yaml
�   +-- prometheus-deployment.yaml
�   +-- prometheus-service.yaml
+-- security/
�   +-- trivy-scan.sh           # Bash local scan script
�   +-- trivy-scan.ps1          # PowerShell local scan script
�   +-- .trivyignore            # CVE accept/suppress list
+-- README.md
.github/workflows/security-scan.yml  # Trivy CI workflow
docs/PHASE_7_COMPLETION_REPORT.md    # Full phase report
backend/server.js                    # +/metrics endpoint
backend/package.json                 # +prom-client dependency
docker-compose.yml                   # +prometheus service
```

### Documentation
- Monitoring details: [`monitoring/README.md`](monitoring/README.md)
- Phase 7 completion report: [`docs/PHASE_7_COMPLETION_REPORT.md`](docs/PHASE_7_COMPLETION_REPORT.md)
