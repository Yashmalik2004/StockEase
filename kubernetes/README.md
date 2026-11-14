# StockEase – Kubernetes Orchestration

This directory contains the production-grade Kubernetes manifest files for deploying and orchestrating the **StockEase Inventory Management System** in a Kubernetes cluster (such as Minikube or cloud Kubernetes).

---

## 1. Architecture Overview

StockEase follows a cloud-native 3-tier architecture deployed in a dedicated `stockease` namespace:

```
                                  Client Browser
                                        │
                                        ▼ (HTTP NodePort 30080)
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

### Key Architectural Highlights:
1. **Namespace Isolation:** All resources are encapsulated within the `stockease` namespace.
2. **Decoupled API Routing:** The frontend container (Nginx) reverse-proxies `/api` requests directly to `http://backend:5000` via Kubernetes CoreDNS service discovery.
3. **Database Security:** The MongoDB instance is exposed strictly via internal `ClusterIP` on port 27017; it is never exposed outside the cluster.
4. **Data Persistence:** Database data is preserved across pod restarts, updates, and node migrations via `mongodb-pvc` (2Gi storage claim).
5. **Least-Privilege Configuration:** Non-sensitive configuration is stored in `ConfigMap`, while sensitive tokens (`JWT_SECRET`) are secured in Kubernetes `Secret`.

---

## 2. Kubernetes Resource Structure

| File | Resource Kind | Name | Purpose |
|---|---|---|---|
| [`namespace.yaml`](./namespace.yaml) | `Namespace` | `stockease` | Dedicated namespace for isolation |
| [`configmap.yaml`](./configmap.yaml) | `ConfigMap` | `stockease-config` | Application config (`PORT`, `MONGO_URI`, `FRONTEND_URL`) |
| [`secret.yaml.example`](./secret.yaml.example) | `Secret` | `stockease-secret` | Sensitive secrets (`JWT_SECRET`) |
| [`mongodb-pvc.yaml`](./mongodb-pvc.yaml) | `PersistentVolumeClaim` | `mongodb-pvc` | 2Gi persistent volume for database |
| [`mongodb-deployment.yaml`](./mongodb-deployment.yaml) | `Deployment` | `mongodb` | Single replica MongoDB 7.0 with liveness/readiness probes |
| [`mongodb-service.yaml`](./mongodb-service.yaml) | `Service` | `mongodb` | ClusterIP service on port 27017 for internal DB access |
| [`backend-deployment.yaml`](./backend-deployment.yaml) | `Deployment` | `backend` | Node.js Express REST API deployment with health probes |
| [`backend-service.yaml`](./backend-service.yaml) | `Service` | `backend` | ClusterIP service on port 5000 for internal API access |
| [`frontend-deployment.yaml`](./frontend-deployment.yaml) | `Deployment` | `frontend` | React + Nginx frontend deployment with health probes |
| [`frontend-service.yaml`](./frontend-service.yaml) | `Service` | `frontend` | NodePort service (port 30080) for external web access |

---

## 3. Prerequisites

Before deploying StockEase to Kubernetes, ensure you have:

1. **Docker Desktop** (or Docker Engine) installed and running.
2. **kubectl** installed and configured (`kubectl version --client`).
3. **Minikube** installed (`minikube version`).

---

## 4. Minikube Startup

Start a local Minikube cluster:

```bash
# Start Minikube with Docker driver (recommended)
minikube start --driver=docker --cpus=2 --memory=4096

# Verify cluster status
minikube status
kubectl cluster-info
```

---

## 5. Docker Image Build and Loading

StockEase uses custom Docker images for the frontend and backend. You can either build them inside Minikube's Docker daemon or build locally and load them into Minikube.

### Option A: Build Directly in Minikube (Recommended)

Point your local terminal's Docker CLI to Minikube's internal Docker daemon:

```bash
# On Linux / macOS:
eval $(minikube docker-env)

# On Windows (PowerShell):
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# On Windows (Command Prompt):
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

Once pointed, build the images directly:

```bash
# Build backend image
docker build -t stockease-backend:latest ./backend

# Build frontend image
docker build -t stockease-frontend:latest ./frontend
```

### Option B: Build Locally and Load into Minikube

If you build using standard local Docker:

```bash
# Build images locally
docker build -t stockease-backend:latest ./backend
docker build -t stockease-frontend:latest ./frontend

# Load images into Minikube cluster cache
minikube image load stockease-backend:latest
minikube image load stockease-frontend:latest
```

Verify images in Minikube:

```bash
minikube image ls | grep stockease
```

---

## 6. Namespace and Secret Creation

### Step 1: Create Namespace

```bash
kubectl apply -f kubernetes/namespace.yaml
```

Verify namespace:

```bash
kubectl get namespaces
```

### Step 2: Create Secrets

Create the sensitive `JWT_SECRET` key using either method below:

**Method 1: Direct kubectl CLI command (Recommended)**
```bash
kubectl create secret generic stockease-secret \
  --from-literal=JWT_SECRET="stockease_jwt_dev_super_secret_key_2026_min_32_chars" \
  -n stockease
```

**Method 2: From template file**
```bash
# Copy template and apply
cp kubernetes/secret.yaml.example kubernetes/secret.yaml
kubectl apply -f kubernetes/secret.yaml
```

### Step 3: Apply ConfigMap

```bash
kubectl apply -f kubernetes/configmap.yaml
```

---

## 7. Deployment Commands

Apply all components in logical dependency order:

```bash
# 1. Apply Persistent Storage for Database
kubectl apply -f kubernetes/mongodb-pvc.yaml

# 2. Deploy MongoDB Database & Service
kubectl apply -f kubernetes/mongodb-deployment.yaml
kubectl apply -f kubernetes/mongodb-service.yaml

# 3. Wait for MongoDB Pod to become Ready
kubectl wait --namespace stockease \
  --for=condition=ready pod \
  --selector=app=mongodb \
  --timeout=90s

# 4. Deploy Backend API & Service
kubectl apply -f kubernetes/backend-deployment.yaml
kubectl apply -f kubernetes/backend-service.yaml

# 5. Wait for Backend Pod to become Ready
kubectl wait --namespace stockease \
  --for=condition=ready pod \
  --selector=app=backend \
  --timeout=90s

# 6. Deploy Frontend UI & Service
kubectl apply -f kubernetes/frontend-deployment.yaml
kubectl apply -f kubernetes/frontend-service.yaml

# 7. Wait for Frontend Pod to become Ready
kubectl wait --namespace stockease \
  --for=condition=ready pod \
  --selector=app=frontend \
  --timeout=90s
```

Or apply all manifests at once:

```bash
kubectl apply -f kubernetes/
```

### Verify Deployment Status:

```bash
# Check all resources in the stockease namespace
kubectl get all -n stockease

# Check PVC binding
kubectl get pvc -n stockease
```

Expected output:
```
NAME                            READY   STATUS    RESTARTS   AGE
pod/mongodb-xxxxxxxxx-xxxxx     1/1     Running   0          2m
pod/backend-xxxxxxxxx-xxxxx     1/1     Running   0          1m
pod/frontend-xxxxxxxxx-xxxxx    1/1     Running   0          30s

NAME               TYPE        CLUSTER-IP       EXTERNAL-IP   PORT(S)        AGE
service/mongodb    ClusterIP   10.96.xxx.xxx    <none>        27017/TCP      2m
service/backend    ClusterIP   10.96.xxx.xxx    <none>        5000/TCP       1m
service/frontend   NodePort    10.96.xxx.xxx    <none>        80:30080/TCP   30s
```

---

## 8. Accessing the Application

In Minikube, access the frontend through the NodePort service:

### Method A: Minikube Service URL (Automated)

```bash
# Open browser automatically:
minikube service frontend -n stockease

# Or print the URL:
minikube service frontend -n stockease --url
```

### Method B: Direct NodePort Access

```bash
# Retrieve Minikube node IP
minikube ip
```

Open your browser at `http://<minikube-ip>:30080`

### Method C: Port Forwarding (Direct Testing)

```bash
# Forward Frontend to localhost:3000
kubectl port-forward svc/frontend 3000:80 -n stockease

# In another terminal, forward Backend to localhost:5000
kubectl port-forward svc/backend 5000:5000 -n stockease
```

Test Backend Health Endpoint:
```bash
curl http://localhost:5000/api/health
# Expected: {"status":"ok","message":"StockEase API is running."}
```

---

## 9. Horizontal Pod Scaling

Kubernetes allows independent scaling of stateless tiers (frontend and backend).

### Scale Backend to 2 Replicas:

```bash
kubectl scale deployment backend --replicas=2 -n stockease
```

Verify scaled pods:

```bash
kubectl get pods -l app=backend -n stockease
```

### Scale Frontend to 3 Replicas:

```bash
kubectl scale deployment frontend --replicas=3 -n stockease
```

Verify scaled pods:

```bash
kubectl get pods -l app=frontend -n stockease
```

### Scale Back Down to 1 Replica:

```bash
kubectl scale deployment backend --replicas=1 -n stockease
kubectl scale deployment frontend --replicas=1 -n stockease
```

---

## 10. Rolling Updates and Rollback

### Check Rollout Status:

```bash
kubectl rollout status deployment/backend -n stockease
kubectl rollout status deployment/frontend -n stockease
```

### Trigger a Rolling Update:

Update backend image (or set an environment variable to force rollout):

```bash
# Update container image to a new tag
kubectl set image deployment/backend backend=stockease-backend:v2 -n stockease

# Monitor rollout progress
kubectl rollout status deployment/backend -n stockease
```

### View Rollout History:

```bash
kubectl rollout history deployment/backend -n stockease
```

### Perform a Rollback:

Undo the previous rollout revision:

```bash
# Roll back to immediate previous revision
kubectl rollout undo deployment/backend -n stockease

# Or roll back to a specific revision (e.g., revision 1)
kubectl rollout undo deployment/backend --to-revision=1 -n stockease

# Verify status
kubectl rollout status deployment/backend -n stockease
```

---

## 11. Troubleshooting Guide

| Issue | Cause | Resolution |
|---|---|---|
| `open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified` | Docker Desktop engine stopped or starting | Start Docker Desktop, wait for engine to initialize, and ensure context is set to `desktop-linux` (`docker context use desktop-linux`). |
| `minikube is not recognized as a cmdlet` (Windows) | Minikube installed via winget but not in active process PATH | Add `C:\Program Files\Kubernetes\Minikube` to User/Machine PATH and restart PowerShell terminal or run: `$env:PATH += ";C:\Program Files\Kubernetes\Minikube"`. |
| `ErrImageNeverPull` / `ImagePullBackOff` | Local image not loaded in Minikube | Run `minikube image load stockease-backend:latest` or build with `eval $(minikube docker-env)`. |
| `CrashLoopBackOff` on backend | MongoDB not ready or JWT_SECRET missing | Check logs: `kubectl logs -l app=backend -n stockease`. Ensure `stockease-secret` exists. |
| Backend cannot connect to MongoDB | DNS or service mismatch | Verify `kubectl get svc mongodb -n stockease` and check `MONGO_URI` in `ConfigMap`. |
| Nginx 502 Bad Gateway | Backend pod down or not ready | Check backend pods: `kubectl get pods -l app=backend -n stockease`. |
| PVC Pending | StorageClass unavailable | Check `kubectl get sc` and `kubectl describe pvc mongodb-pvc -n stockease`. |

### Useful Debugging Commands:

```bash
# View pod logs
kubectl logs -f deployment/backend -n stockease
kubectl logs -f deployment/frontend -n stockease
kubectl logs -f deployment/mongodb -n stockease

# Describe resources for events
kubectl describe pod <pod-name> -n stockease
kubectl describe svc frontend -n stockease
kubectl describe pvc mongodb-pvc -n stockease

# Exec into container
kubectl exec -it deployment/backend -n stockease -- sh
kubectl exec -it deployment/mongodb -n stockease -- mongosh
```

---

## 12. Cleanup Commands

To remove all deployed resources and tear down the namespace:

```bash
# Delete all resources in stockease namespace
kubectl delete -f kubernetes/

# Or delete entire namespace directly (cascades to all objects)
kubectl delete namespace stockease

# Stop Minikube cluster (when finished)
minikube stop
```
