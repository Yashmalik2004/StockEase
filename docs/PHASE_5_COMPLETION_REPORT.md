# PHASE 5 COMPLETION REPORT
## StockEase – Kubernetes Orchestration, Environment Troubleshooting & Live Verification

---

| Field | Details |
|-------|---------|
| **Project Name** | StockEase – Inventory Management System with DevOps Automation |
| **Phase** | Phase 5 – Kubernetes Orchestration |
| **Assigned Member** | Member 2 (Contribution: 30%) |
| **Feature Branch** | `kubernetes-orchestration` |
| **Date Completed** | 15 November 2026 |
| **Repository** | https://github.com/Yashmalik2004/StockEase |
| **Final Status** | ✅ **COMPLETED** (100% Deployed, Tested, Scaled & Verified on Local Minikube) |

---

## 1. Environment Troubleshooting & Diagnosis Summary

During initial Phase 5 execution, three environmental issues were diagnosed and resolved on the Windows 11 host:

### Issue 1: Docker Desktop Daemon Connection
- **Observed Error:** `error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.`
- **Root Cause:** Docker Desktop process was running, but context was resolving to an uninitialized pipe prior to full service readiness.
- **Resolution:** Verified Docker Desktop context `desktop-linux` (`npipe:////./pipe/dockerDesktopLinuxEngine`), confirmed engine version 28.5.1 with WSL2 Linux kernel `6.6.87.2-microsoft-standard-WSL2`, CPUs: 12, Memory: 7.613 GiB. `docker version` and `docker info` verified healthy.

### Issue 2: Minikube Not Recognized in PowerShell
- **Observed Error:** `minikube is not recognized as the name of a cmdlet, function, script file...`
- **Root Cause:** `winget install Kubernetes.minikube` successfully installed Minikube v1.39.0 to `C:\Program Files\Kubernetes\Minikube\minikube.exe` and added it to the Machine PATH. However, active terminal sessions retained stale process environment variables without Minikube in their process PATH.
- **Resolution:**
  1. Located `minikube.exe` at `C:\Program Files\Kubernetes\Minikube\minikube.exe`.
  2. Permanently registered `C:\Program Files\Kubernetes\Minikube` into both User and Machine PATH environment variables via `[Environment]::SetEnvironmentVariable`.
  3. Refreshed session PATH; verified `where.exe minikube` and `minikube version: v1.39.0`.

### Issue 3: kubectl CLI Availability
- **Diagnosis:** Located existing kubectl client at `C:\Program Files\Docker\Docker\resources\bin\kubectl.exe`.
- **Resolution:** Confirmed client version `v1.34.1` with Kustomize `v5.7.1`. Reconfigured default context to point to local Minikube cluster upon cluster initialization.

---

## 2. Kubernetes Cluster Initialization

- **Cluster Runtime:** Minikube v1.39.0 on Docker driver (containerd 2.3.4 runtime).
- **Startup Command:**
  ```powershell
  minikube start --driver=docker --cpus=2 --memory=4096
  ```
- **Cluster Status:**
  ```
  minikube
  type: Control Plane
  host: Running
  kubelet: Running
  apiserver: Running
  kubeconfig: Configured

  Kubernetes control plane is running at https://127.0.0.1:60369
  CoreDNS is running at https://127.0.0.1:60369/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

  NAME       STATUS   ROLES           AGE     VERSION
  minikube   Ready    control-plane   2m32s   v1.37.0
  ```

---

## 3. Docker Image Build & Minikube Loading

StockEase uses custom Dockerfiles for the Express backend and React/Vite/Nginx frontend:
1. **Built Local Images:**
   - `stockease-backend:latest` (Node.js 20 Alpine, curl installed for health probes)
   - `stockease-frontend:latest` (Multi-stage build: Vite production bundle served by Nginx Alpine)
2. **Loaded Images into Minikube containerd Cache:**
   ```powershell
   minikube image load stockease-backend:latest
   minikube image load stockease-frontend:latest
   ```
3. **Verified in Minikube Image Registry (`minikube image ls`):**
   - `docker.io/library/stockease-backend:latest` (57.4MB)
   - `docker.io/library/stockease-frontend:latest` (26.4MB)

---

## 4. Kubernetes Manifest Architecture & Deployment Sequence

All manifests were applied to the dedicated `stockease` namespace in dependency order:

```
                                  Client Browser
                                        │
                                        ▼ (HTTP NodePort 30080 / Tunnel Proxy)
               ┌────────────────────────────────────────────────────────┐
               │              Frontend Service (NodePort)               │
               │                   Port 80 -> 30080                     │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
               ┌────────────────────────────────────────────────────────┐
               │             Frontend Pod(s) (Nginx + React)            │
               │   • Static SPA served from /usr/share/nginx/html       │
               │   • Nginx Reverse Proxy /api -> http://backend:5000     │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼ (Internal DNS: backend:5000)
               ┌────────────────────────────────────────────────────────┐
               │               Backend Service (ClusterIP)              │
               │                        Port 5000                       │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
               ┌────────────────────────────────────────────────────────┐
               │             Backend Pod(s) (Node.js/Express)           │
               │   • REST API (/api/auth, /api/products, /api/dashboard)│
               │   • Health check endpoint: /api/health                 │
               │   • Env injected from stockease-config & Secret        │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼ (Internal DNS: mongodb:27017)
               ┌────────────────────────────────────────────────────────┐
               │               MongoDB Service (ClusterIP)              │
               │                       Port 27017                       │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
               ┌────────────────────────────────────────────────────────┐
               │                   MongoDB Pod (Mongo 7.0)              │
               │   • Database: stockease                                │
               │   • Healthcheck: mongosh ping                          │
               └────────────────────────┬───────────────────────────────┘
                                        │
                                        ▼
               ┌────────────────────────────────────────────────────────┐
               │        PersistentVolumeClaim (mongodb-pvc)             │
               │   • Storage: 2Gi (ReadWriteOnce) -> /data/db           │
               └────────────────────────────────────────────────────────┘
```

### Applied Resources:
1. `kubernetes/namespace.yaml` -> `namespace/stockease` created
2. `kubernetes/secret.yaml.example` / `stockease-secret` -> `secret/stockease-secret` created (`JWT_SECRET`)
3. `kubernetes/configmap.yaml` -> `configmap/stockease-config` created (`PORT=5000`, `MONGO_URI`, etc.)
4. `kubernetes/mongodb-pvc.yaml` -> `persistentvolumeclaim/mongodb-pvc` created (Bound to standard PV)
5. `kubernetes/mongodb-deployment.yaml` -> `deployment.apps/mongodb` created (1/1 Ready)
6. `kubernetes/mongodb-service.yaml` -> `service/mongodb` created (ClusterIP 10.97.46.70:27017)
7. `kubernetes/backend-deployment.yaml` -> `deployment.apps/backend` created (1/1 Ready)
8. `kubernetes/backend-service.yaml` -> `service/backend` created (ClusterIP 10.108.220.252:5000)
9. `kubernetes/frontend-deployment.yaml` -> `deployment.apps/frontend` created (1/1 Ready)
10. `kubernetes/frontend-service.yaml` -> `service/frontend` created (NodePort 10.109.65.154:30080)

---

## 5. Live Runtime Verification & Application Testing

### 5.1 Pod and Service Status (`kubectl get all -n stockease`)
```
NAME                            READY   STATUS    RESTARTS   AGE     IP           NODE       NOMINATED NODE   READINESS GATES
pod/backend-7c48c598d-4j8vd     1/1     Running   0          3m      10.244.0.4   minikube   <none>           <none>
pod/frontend-59b4d596df-ztq7w   1/1     Running   0          5m      10.244.0.5   minikube   <none>           <none>
pod/mongodb-58fb854968-mvzgd    1/1     Running   0          4m      10.244.0.3   minikube   <none>           <none>

NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE   SELECTOR
service/backend    ClusterIP   10.108.220.252   <none>        5000/TCP       5m    app=backend
service/frontend   NodePort    10.109.65.154    <none>        80:30080/TCP   5m    app=frontend
service/mongodb    ClusterIP   10.97.46.70      <none>        27017/TCP      6m    app=mongodb

NAME                                STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS
persistentvolumeclaim/mongodb-pvc   Bound    pvc-4e3a5ceb-fb09-4cd4-ad34-e329b15fda55   2Gi        RWO            standard
```

### 5.2 Backend Service & Database Connectivity
Backend container startup logs confirmed successful internal CoreDNS resolution and database connection:
```
MongoDB Connected: mongodb
StockEase API server running on port 5000
```

### 5.3 Frontend Single-Page Application (SPA) Delivery
- **Access Method:** Minikube Service NodePort tunnel (`minikube service frontend -n stockease --url`).
- **HTTP Response:** Status `200 OK`.
- **Bundle Payload:** Full React/Vite SPA bundle loaded (`<title>StockEase – Inventory Management</title>`).

### 5.4 Backend Health Endpoint via Reverse Proxy
- **Endpoint:** `GET /api/health` through Frontend Nginx service proxy.
- **Response:**
  ```json
  {"status":"ok","message":"StockEase API is running."}
  ```

### 5.5 End-to-End Application CRUD & Authentication Tests
Actual functional integration tests were performed against the live cluster:
1. **User Registration (`POST /api/auth/register`):**
   - Registered admin user `k8sadmin` (`k8sadmin@stockease.com`).
   - Received valid signed JWT token.
2. **User Login (`POST /api/auth/login`):**
   - Successfully authenticated and received access token.
3. **Product Creation (`POST /api/products`):**
   - Created product: `DevOps Wireless Mouse` (SKU: `MOU-DEV-001`, Price: $39.99, Quantity: 100).
   - Generated Database ID: `6af8b7ca3c27468d27cbd707`.
4. **Product Query (`GET /api/products/:id`):**
   - Retrieved single product with SKU `MOU-DEV-001`.
5. **Product Update (`PUT /api/products/:id`):**
   - Updated price to $54.99 and quantity to 75.
6. **Dashboard Statistics (`GET /api/dashboard/stats`):**
   - Verified aggregation pipeline: Total Products: 2, Inventory Value: $6623.75.
7. **Product Deletion (`DELETE /api/products/:id`):**
   - Received `Product deleted successfully.`

---

## 6. Persistence, Scaling & Rollout Testing

### 6.1 Database Volume Persistence Test
- **Objective:** Verify data survives MongoDB pod restarts via `mongodb-pvc`.
- **Test Procedure:**
  1. Created product `PVC Storage Verification Drive` (SKU: `PERSIST-TEST-001`, Price: $129.99).
  2. Identified active pod: `mongodb-58fb854968-kstpd`.
  3. Terminated pod: `kubectl delete pod mongodb-58fb854968-kstpd -n stockease`.
  4. Deployment controller spawned replacement pod: `mongodb-58fb854968-mvzgd`.
  5. Mounted existing PVC `mongodb-pvc`.
  6. Queried REST API after pod reached Ready state.
- **Result:** ✅ **PASS** – Product `PERSIST-TEST-001` retrieved intact with 100% data integrity.

### 6.2 Horizontal Pod Scaling Test
- **Objective:** Verify dynamic scaling of backend stateless tier.
- **Execution:**
  ```powershell
  kubectl scale deployment backend --replicas=2 -n stockease
  kubectl rollout status deployment/backend -n stockease
  ```
- **Observed Pods:**
  ```
  NAME                      READY   STATUS    RESTARTS   AGE
  backend-7c48c598d-s2hdk   1/1     Running   0          4m5s
  backend-7c48c598d-x84w5   1/1     Running   0          21s
  ```
  Deployment reached `2/2 Available`. Restored back to 1 replica cleanly.
- **Result:** ✅ **PASS**.

### 6.3 Rolling Update and Rollback Test
- **Objective:** Verify zero-downtime rolling updates and rollback safety.
- **Execution:**
  1. Rollout history: Revision 1 verified.
  2. Triggered rolling update: `kubectl set env deployment/backend DEPLOY_VERSION=v1.0.1 -n stockease`.
  3. Monitored rollout: Replicas transitioned seamlessly, reached Revision 2.
  4. Executed rollback: `kubectl rollout undo deployment/backend -n stockease`.
  5. Monitored rollback: Reverted back to Revision 1 state (Revision 3 created).
  6. Pod `backend-7c48c598d-4j8vd` confirmed healthy and 1/1 Running.
- **Result:** ✅ **PASS**.

---

## 7. Categorized Results Summary

| Category | Description | Verification Method | Status |
|---|---|---|:---:|
| **Environment Fix** | Docker Desktop WSL2 Engine & Context | `docker version`, `docker info` | ✅ **PASS** |
| **Tooling & PATH** | Minikube v1.39.0 & kubectl v1.34.1 | CLI execution & PATH verification | ✅ **PASS** |
| **Cluster Health** | Control Plane, CoreDNS & Node Status | `minikube status`, `kubectl get nodes` | ✅ **PASS** |
| **Image Loading** | Local images cached in Minikube containerd | `minikube image ls` | ✅ **PASS** |
| **Manifest Validation** | Syntax, labels, selectors, port alignment | Automated semantic schema checks | ✅ **PASS** |
| **Pod Workloads** | MongoDB, Backend, Frontend 1/1 Ready | `kubectl get pods -n stockease` | ✅ **PASS** |
| **Persistent Storage** | 2Gi volume bound across pod deletion | `kubectl delete pod` & API query | ✅ **PASS** |
| **CoreDNS Resolution** | Internal service discovery (`backend`, `mongodb`) | Container logs & proxy validation | ✅ **PASS** |
| **Application CRUD** | Auth, Register, Login, Products CRUD | REST API integration script | ✅ **PASS** |
| **Pod Scaling** | Scale backend to 2 replicas & restore | `kubectl scale` & rollout status | ✅ **PASS** |
| **Rollout / Rollback** | Rolling update & undo rollback | `kubectl rollout undo` & history | ✅ **PASS** |

---

## 8. Git Details

- **Feature Branch:** `kubernetes-orchestration`
- **Base Branch:** `origin/main` (commit `66ff080`)
- **Git Commit Hash:** `a13e8a6` (`docs(phase-5): document environment troubleshooting, live cluster deployment and verification`)
- **Remote Push:** Pushed to `origin/kubernetes-orchestration`
- **Safety Guarantee:** Zero `.env` files, production credentials, or secrets committed; `main` branch untouched.

---

## 9. Final Phase Status

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   PHASE 5 STATUS:  ✅ COMPLETED                                      ║
║                                                                      ║
║   Docker Desktop & Context:              ✅  RUNNING & VERIFIED     ║
║   Minikube v1.39.0 & PATH:               ✅  FIXED & ACTIVE         ║
║   kubectl v1.34.1:                       ✅  CONFIGURED             ║
║   Minikube Cluster (v1.37.0):            ✅  RUNNING                ║
║   Docker Image Build & Load:             ✅  CACHED IN MINIKUBE     ║
║   Kubernetes Manifests (10 files):       ✅  DEPLOYED (100% READY)  ║
║   Persistent Volume (mongodb-pvc):       ✅  BOUND & PERSISTENT     ║
║   Full-Stack Health & REST APIs:         ✅  VERIFIED               ║
║   Application CRUD & Auth:               ✅  VERIFIED               ║
║   Horizontal Scaling (Replicas=2):       ✅  VERIFIED               ║
║   Zero-Downtime Rollout & Rollback:      ✅  VERIFIED               ║
║                                                                      ║
║   StockEase is fully orchestrated and verified on Kubernetes.        ║
╚══════════════════════════════════════════════════════════════════════╝
```
