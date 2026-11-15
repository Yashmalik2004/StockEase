# StockEase – Architecture Reference

> **University DevOps Capstone Project**  
> Version: Final (Phase 8) | November 2026

This document describes the complete technical architecture of StockEase across all eight implemented phases, including application design, container topology, CI/CD pipeline, Kubernetes deployment, Ansible automation, and observability stack.

---

## 1. Application Architecture

```mermaid
flowchart TD
    Browser["🌐 Browser\n(User / Admin)"]
    Nginx["🔀 Nginx\n(port 80)\nStatic file server\n+ /api proxy"]
    Express["⚙️ Express API\n(port 5000)\nREST endpoints\nJWT middleware"]
    MongoDB["🗄️ MongoDB\n(port 27017)\nProduct & Admin\ndocuments"]
    Prometheus["📊 Prometheus\n(port 9090)\nScrapes /metrics\nevery 10s"]

    Browser -->|"HTTP requests"| Nginx
    Nginx -->|"Static files (React SPA)"| Browser
    Nginx -->|"Proxy /api/*"| Express
    Express -->|"Mongoose queries"| MongoDB
    MongoDB -->|"Query results"| Express
    Express -->|"JSON responses"| Nginx
    Prometheus -->|"GET /metrics"| Express
```

---

## 2. API Request Flow

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Nginx :80
    participant E as Express :5000
    participant M as MongoDB :27017

    B->>N: GET / (React app)
    N-->>B: index.html + JS bundle

    B->>N: POST /api/auth/login
    N->>E: Proxy POST /api/auth/login
    E->>M: db.admins.findOne({email})
    M-->>E: Admin document
    E-->>N: 200 { token: "JWT..." }
    N-->>B: 200 { token: "JWT..." }

    B->>N: GET /api/products (Authorization: Bearer JWT)
    N->>E: Proxy GET /api/products
    E->>E: Verify JWT (auth middleware)
    E->>M: db.products.find()
    M-->>E: Products array
    E-->>N: 200 [products]
    N-->>B: 200 [products]
```

---

## 3. Docker Compose Container Topology

```mermaid
flowchart LR
    subgraph Host["🖥️ Host Machine"]
        subgraph DC["docker-compose.yml"]
            FE["frontend\nNginx:Alpine\nPort 3000→80\nServes React SPA\nProxies /api"]
            BE["backend\nNode.js:20-Alpine\nPort 5001→5000\nExpress REST API"]
            DB["mongodb\nmongo:7.0\nPort 27017:27017\nVolume: mongo_data"]
            PR["prometheus\nprom/prometheus:v2.51.2\nPort 9090:9090\nScrapes backend:5000"]
        end
    end

    FE -->|"http://backend:5000/api"| BE
    BE -->|"mongodb://mongodb:27017"| DB
    PR -->|"http://backend:5000/metrics"| BE
```

**Network:** All services share the `stockease-network` bridge network.  
**Volumes:** `mongo_data` persists MongoDB data across restarts.  
**Environment:** Configured via `.env` (copied from `.env.example`).

---

## 4. GitHub Actions CI/CD Pipeline

```mermaid
flowchart TD
    Push["📤 git push\n(main or\nfeature branch)"]
    
    subgraph CI["ci.yml — GitHub Actions"]
        BackendCI["backend-ci\n• npm ci\n• npm test\n• Lint"]
        FrontendCI["frontend-ci\n• npm ci\n• npm run build\n• Lint"]
        DockerCI["docker-ci\n(needs: backend-ci, frontend-ci)\n• Docker Buildx\n• Build backend image\n• Build frontend image\n• Trivy image scan"]
    end

    subgraph Security["security-scan.yml — GitHub Actions"]
        TrivyBE["trivy-backend\nScan backend image\nSARIF → GitHub Security"]
        TrivyFE["trivy-frontend\nScan frontend image\nSARIF → GitHub Security"]
        TrivyFS["trivy-filesystem\nScan repo files\n+ secret detection\nSARIF → GitHub Security"]
    end

    Push --> BackendCI
    Push --> FrontendCI
    BackendCI --> DockerCI
    FrontendCI --> DockerCI

    Push -->|"push main\nor weekly\nor manual"| TrivyBE
    Push -->|"push main\nor weekly\nor manual"| TrivyFE
    Push -->|"push main\nor weekly\nor manual"| TrivyFS
```

---

## 5. Kubernetes Deployment Architecture

```mermaid
flowchart TD
    subgraph Minikube["☸️ Minikube Cluster"]
        subgraph NS["Namespace: stockease"]
            CM["ConfigMap\nstockease-config\nMONGO_URI\nFRONTEND_URL"]
            SEC["Secret\nstockease-secret\nJWT_SECRET (base64)"]

            subgraph MongoDB["MongoDB"]
                PVC["PersistentVolumeClaim\n1Gi storage"]
                MDBDEP["Deployment\nmongodb\n1 replica\nmongo:7.0"]
                MDBSVC["Service\nmongodb\nClusterIP:27017"]
            end

            subgraph Backend["Backend"]
                BEDEP["Deployment\nbackend\n1 replica\nstockease-backend:latest"]
                BESVC["Service\nbackend\nClusterIP:5000"]
            end

            subgraph Frontend["Frontend"]
                FEDEP["Deployment\nfrontend\n1 replica\nstockease-frontend:latest"]
                FESVC["Service\nfrontend\nNodePort:30080"]
            end

            subgraph Monitoring["Monitoring"]
                PRDEP["Deployment\nprometheus\n1 replica\nprom/prometheus:v2.51.2"]
                PRSVC["Service\nprometheus\nNodePort:30090"]
                PRCM["ConfigMap\nprometheus-config"]
            end
        end
    end

    PVC --> MDBDEP
    MDBDEP --> MDBSVC
    CM --> BEDEP
    SEC --> BEDEP
    BEDEP --> BESVC
    FEDEP --> FESVC
    PRCM --> PRDEP
    PRDEP --> PRSVC

    BESVC -->|"mongodb://mongodb:27017"| MDBSVC
    FESVC -->|"proxy /api → backend:5000"| BESVC
    PRSVC -->|"scrape /metrics"| BESVC
```

**Access URLs (Minikube):**
- Frontend: `minikube service frontend -n stockease` → NodePort 30080
- Prometheus: `minikube service prometheus -n stockease` → NodePort 30090

---

## 6. Ansible Automation Flow

```mermaid
flowchart TD
    Operator["👤 Operator\n(WSL2 terminal)"]
    
    subgraph Playbook["ansible/playbooks/deploy.yml (35 tasks)"]
        Pre["Pre-flight\n• Verify kubectl\n• Verify minikube\n• Check cluster status"]
        NS["Namespace\n• Create stockease namespace"]
        Secret["JWT Secret\n• Read ~/.stockease/jwt_secret\n• Create K8s Secret (idempotent)"]
        Config["ConfigMap\n• Apply stockease-config"]
        DB["MongoDB\n• PVC\n• Deployment\n• Service\n• Wait for ready"]
        BE["Backend\n• Deployment\n• Service\n• Wait for ready"]
        FE["Frontend\n• Deployment\n• Service\n• Wait for ready"]
        Val["Post-deploy\n• Verify all pods Running\n• Check endpoints"]
    end

    subgraph Validate["ansible/playbooks/validate.yml (22 tasks)"]
        V1["Pod health checks"]
        V2["Service endpoint tests"]
        V3["API smoke tests\n(health, auth, products)"]
        V4["Prometheus scrape\nverification"]
    end

    Operator -->|"ansible-playbook deploy.yml"| Pre
    Pre --> NS --> Secret --> Config --> DB --> BE --> FE --> Val
    Operator -->|"ansible-playbook validate.yml"| Validate
```

**Idempotency:** Second playbook run achieves `ok=35 changed=0` — JWT secret is read from `~/.stockease/jwt_secret` (outside the repository) and base64-encoded in the `data:` field of the K8s Secret resource to prevent spurious updates.

---

## 7. Monitoring and Observability

```mermaid
flowchart LR
    subgraph Backend["Express Backend :5000"]
        Metrics["GET /metrics\n(prom-client)"]
        Custom["Custom Metrics\n• stockease_http_requests_total\n• stockease_http_request_duration_seconds\n• stockease_active_requests"]
        Default["Default Node.js Metrics\n• heap size\n• event loop lag\n• CPU time"]
    end

    subgraph Prom["Prometheus :9090"]
        Scrape["Scrape every 10s"]
        Rules["Alert Rules (4)\n• BackendDown\n• HighErrorRate\n• HighLatency\n• HighMemoryUsage"]
        TSDB["Time-Series DB"]
    end

    Scrape -->|"HTTP GET /metrics"| Metrics
    Metrics --> Custom
    Metrics --> Default
    Prom --> TSDB
    Rules --> TSDB
```

**Key PromQL queries:**
```promql
rate(stockease_http_requests_total[5m])
histogram_quantile(0.95, rate(stockease_http_request_duration_seconds_bucket[5m]))
stockease_active_requests
up{job="stockease-backend"}
```

---

## 8. Security Scanning (Trivy)

```mermaid
flowchart TD
    Trigger["Trigger\n• Push to main\n• PR to main\n• Weekly (Mon 02:00 UTC)\n• Manual dispatch"]

    subgraph Trivy["security-scan.yml — 3 Parallel Jobs"]
        J1["trivy-backend-image\n• Build backend Docker image\n• Scan for CVEs\n• SARIF → GitHub Security tab"]
        J2["trivy-frontend-image\n• Build frontend Docker image\n• Scan for CVEs\n• SARIF → GitHub Security tab"]
        J3["trivy-filesystem\n• Scan repository files\n• Detect secrets/misconfigs\n• SARIF → GitHub Security tab"]
    end

    Trigger --> J1
    Trigger --> J2
    Trigger --> J3
```

**Suppression:** `.trivyignore` in `monitoring/security/` suppresses accepted/known CVEs with justification comments.

---

## 9. Data Flow Summary

```mermaid
flowchart LR
    Dev["👨‍💻 Developer"]
    GH["GitHub\nRepository"]
    GHACT["GitHub Actions\nCI / Security Scan"]
    DockerCR["Docker\n(local or compose)"]
    K8s["Kubernetes\n(Minikube)"]
    Ansible["Ansible\n(WSL2)"]
    Prom["Prometheus"]
    Trivy["Trivy"]

    Dev -->|"git push"| GH
    GH -->|"webhook trigger"| GHACT
    GHACT -->|"build & scan images"| Trivy
    Dev -->|"docker compose up"| DockerCR
    Dev -->|"ansible-playbook deploy.yml"| Ansible
    Ansible -->|"kubectl apply"| K8s
    K8s -->|"scrape /metrics"| Prom
    DockerCR -->|"scrape /metrics"| Prom
```

---

*Architecture document prepared by the StockEase Project Team — November 2026*
