# StockEase – Ansible Automation (Phase 6)

> **DevOps Capstone Project | University Assignment**

This directory contains the Ansible automation for deploying the StockEase full-stack application to a Kubernetes cluster.

---

## Table of Contents

1. [What Ansible Does in StockEase](#1-what-ansible-does-in-stockease)
2. [Why Ansible Alongside Docker and Kubernetes](#2-why-ansible-alongside-docker-and-kubernetes)
3. [Directory Structure](#3-directory-structure)
4. [Prerequisites](#4-prerequisites)
5. [Execution Environment Setup](#5-execution-environment-setup)
6. [Inventory Configuration](#6-inventory-configuration)
7. [Secret Configuration](#7-secret-configuration)
8. [Running the Deployment Playbook](#8-running-the-deployment-playbook)
9. [Running in Check Mode (Dry Run)](#9-running-in-check-mode-dry-run)
10. [Validating the Deployment](#10-validating-the-deployment)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What Ansible Does in StockEase

Ansible automates the complete Kubernetes deployment of the StockEase application in an **ordered, idempotent, and repeatable** manner.

The primary deployment playbook (`playbooks/deploy.yml`) performs:

| Step | Action |
|------|--------|
| **Preflight** | Verifies `kubectl` availability and cluster connectivity |
| **Preflight** | Confirms all 10 Kubernetes manifest files are present |
| **Preflight** | Validates `JWT_SECRET` is set via environment variable |
| **Namespace** | Applies `kubernetes/namespace.yaml` → `stockease` namespace |
| **ConfigMap** | Applies `kubernetes/configmap.yaml` → non-sensitive app config |
| **Secret** | Creates/updates `stockease-secret` from the `JWT_SECRET` env var |
| **MongoDB** | Applies PVC, Deployment, and Service for MongoDB |
| **MongoDB** | Waits for MongoDB pod to reach `Ready` state |
| **Backend** | Applies Backend Deployment and Service |
| **Backend** | Waits for Backend pod to reach `Ready` state |
| **Frontend** | Applies Frontend Deployment and Service |
| **Frontend** | Waits for Frontend pod to reach `Ready` state |
| **Summary** | Prints final resource status and access instructions |

The validation playbook (`playbooks/validate.yml`) independently checks:
- Cluster reachability
- Namespace existence and Active status
- MongoDB pod readiness
- Backend pod readiness
- Frontend pod readiness
- Backend `/api/health` response via `kubectl exec`

---

## 2. Why Ansible Alongside Docker and Kubernetes

| Tool | Role |
|------|------|
| **Docker** | Packages the application into portable container images |
| **Docker Compose** | Runs the full stack locally for development and testing |
| **Kubernetes** | Orchestrates containers in production — handles scheduling, scaling, self-healing, networking |
| **Ansible** | **Automates and sequences** the Kubernetes deployment — applies manifests in dependency order, manages secrets safely, waits for readiness, and validates health |

Without Ansible, the Kubernetes deployment requires 10+ `kubectl apply` commands, manual ordering, manual waiting, and manual secret management. Ansible replaces this with a single, declarative, idempotent playbook that is easy to review, version-control, and rerun.

---

## 3. Directory Structure

```
ansible/
│
├── ansible.cfg              ← Ansible runtime configuration
├── requirements.yml         ← Collection dependencies (minimal)
├── README.md                ← This file
│
├── inventory/
│   └── hosts.ini            ← Target host inventory (localhost for local K8s)
│
├── group_vars/
│   └── all.yml              ← Shared variables (namespace, paths, timeouts)
│
└── playbooks/
    ├── deploy.yml           ← Primary deployment playbook (full cluster deploy)
    └── validate.yml         ← Validation playbook (health checks only)
```

The existing Kubernetes manifests in `kubernetes/` are **reused directly** — not duplicated inside `ansible/`.

---

## 4. Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| **Ansible** | ≥ 2.14 | Installed in WSL2 Ubuntu or Docker container |
| **kubectl** | ≥ 1.27 | Must be configured and pointing to your cluster |
| **Minikube** | ≥ 1.30 | Required for local cluster (Docker driver) |
| **Docker Desktop** | ≥ 4.x | Required on Windows host for Minikube docker driver |
| **Python** | ≥ 3.9 | Required by Ansible (included in Ubuntu) |

---

## 5. Execution Environment Setup

> **Important:** Ansible does not run natively on Windows PowerShell. Use one of the methods below.

### Option A: WSL2 Ubuntu (Recommended)

#### 5.1 Open WSL2 Ubuntu
In Windows, open Start → "Ubuntu" (or run `wsl` in PowerShell).

#### 5.2 Install Ansible in WSL2
```bash
sudo apt update
sudo apt install -y ansible python3-pip
ansible --version
```

#### 5.3 Ensure kubectl is available inside WSL2
kubectl installed in Windows is NOT automatically available in WSL2. Install it:
```bash
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/kubectl
kubectl version --client
```

#### 5.4 Copy kubeconfig from Windows to WSL2
```bash
mkdir -p ~/.kube
cp /mnt/c/Users/YASH/.kube/config ~/.kube/config
# Adjust the server URL — replace 127.0.0.1 with the actual Minikube IP if needed
# Check with: minikube ip (from PowerShell) then update ~/.kube/config in WSL2
kubectl cluster-info
```

#### 5.5 Navigate to the project
```bash
cd /mnt/c/Users/YASH/Desktop/projects/StockEase/ansible
```

---

### Option B: Docker-based Ansible (Alternative)

If WSL2 is not available, run Ansible inside a Docker container:

```bash
# From PowerShell (Docker Desktop must be running)
docker run --rm -it \
  -v C:/Users/YASH/Desktop/projects/StockEase:/stockease \
  -v C:/Users/YASH/.kube:/root/.kube:ro \
  -e JWT_SECRET=your_secret_here \
  --network host \
  willhallonline/ansible:latest \
  bash -c "cd /stockease/ansible && ansible-playbook playbooks/deploy.yml"
```

> **Note:** `--network host` may not work reliably on Docker Desktop for Windows. WSL2 is preferred.

---

## 6. Inventory Configuration

The inventory file at `inventory/hosts.ini` configures Ansible to run kubectl commands on `localhost` (the control machine where kubectl is configured):

```ini
[k8s_control]
localhost ansible_connection=local

[k8s_control:vars]
k8s_namespace=stockease
manifests_dir=../kubernetes
kubectl=kubectl
use_minikube=true
```

**Variables you may need to adjust:**

| Variable | Default | When to Change |
|----------|---------|----------------|
| `k8s_namespace` | `stockease` | Only if you changed the namespace |
| `manifests_dir` | `../kubernetes` | Adjust if running from a different directory |
| `kubectl` | `kubectl` | Set full path if kubectl is not in PATH |
| `use_minikube` | `true` | Set to `false` for cloud/remote clusters |

---

## 7. Secret Configuration

> ⚠️ **Never commit real secrets to Git.**

The JWT secret is passed to Ansible via an **environment variable** — not hardcoded in any playbook or vars file.

#### Before running the playbook, set the environment variable:

```bash
# In WSL2 or Linux shell:
export JWT_SECRET=your_secure_random_jwt_secret_key_minimum_32_chars

# Verify it is set:
echo $JWT_SECRET
```

The playbook will fail with a clear error message if `JWT_SECRET` is not set.

The secret is applied to Kubernetes using `kubectl create secret generic` imperatively — no Base64-encoded secret YAML is committed.

#### Reference Template

See `kubernetes/secret.yaml.example` for the Kubernetes Secret structure (uses a placeholder, never real credentials).

---

## 8. Running the Deployment Playbook

> Run all commands from inside the `ansible/` directory.

```bash
cd /mnt/c/Users/YASH/Desktop/projects/StockEase/ansible

# Set the JWT secret
export JWT_SECRET=your_secure_jwt_secret_key_32chars_minimum

# 1. Run syntax check first (no cluster connection needed)
ansible-playbook playbooks/deploy.yml --syntax-check

# 2. Run the full deployment
ansible-playbook playbooks/deploy.yml

# 3. Run with verbose output (recommended for first run)
ansible-playbook playbooks/deploy.yml -v

# 4. Run only specific stages using tags
ansible-playbook playbooks/deploy.yml --tags "namespace,config,secret"
ansible-playbook playbooks/deploy.yml --tags "mongodb"
ansible-playbook playbooks/deploy.yml --tags "backend"
ansible-playbook playbooks/deploy.yml --tags "frontend"
ansible-playbook playbooks/deploy.yml --tags "verify"
```

#### Expected Output

```
PLAY [StockEase – Kubernetes Deployment Automation] *****************************

TASK [PREFLIGHT | Verify kubectl is available] *****
ok: [localhost]

TASK [PREFLIGHT | Verify Kubernetes cluster connectivity] *****
ok: [localhost]

TASK [NAMESPACE | Apply stockease namespace] *****
ok: [localhost]

... (all tasks run in order) ...

TASK [SUMMARY | Deployment complete] *****
ok: [localhost] => {
    "msg": "StockEase Kubernetes Deployment – COMPLETE\n..."
}

PLAY RECAP *****
localhost : ok=28  changed=0  unreachable=0  failed=0
```

---

## 9. Running in Check Mode (Dry Run)

Check mode runs the playbook logic without making any real changes:

```bash
ansible-playbook playbooks/deploy.yml --check
```

> **Note:** Some tasks use `kubectl` commands that check mode cannot fully simulate (e.g., `kubectl wait`). These tasks may show as "skipped" in check mode. This is expected behavior.

---

## 10. Validating the Deployment

After deployment, run the standalone validation playbook:

```bash
ansible-playbook playbooks/validate.yml
```

This will:
1. Check cluster connectivity
2. Verify the `stockease` namespace is Active
3. Wait for MongoDB, Backend, and Frontend pods to be Ready
4. Test the backend `/api/health` endpoint via `kubectl exec`

#### Manual Validation (Alternative)

```bash
# Check all pods
kubectl get pods -n stockease

# Check all resources
kubectl get all -n stockease

# Check backend health
kubectl exec -n stockease deployment/backend -- wget -qO- http://localhost:5000/api/health

# Access the frontend
minikube service frontend -n stockease --url
```

---

## 11. Troubleshooting

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| `kubectl: command not found` | kubectl not installed in WSL2 | Install kubectl in WSL2 (Section 5.3) |
| `Unable to connect to the server` | kubeconfig not set up in WSL2 | Copy kubeconfig (Section 5.4) |
| `JWT_SECRET environment variable is not set` | env var not exported | `export JWT_SECRET=your_secret` |
| `manifests directory not found` | Running from wrong directory | `cd` to `ansible/` before running |
| `MongoDB deployment not ready` | Minikube images not loaded | `minikube image load stockease-backend:latest` |
| `ImagePullBackOff` on backend/frontend | Images not in Minikube cache | `docker build` then `minikube image load` |
| `Permission denied on .git/` | VS Code holding git locks | Close VS Code source control or switch tabs |

---

## Status

> ✅ **Phase 6 – COMPLETED**
>
> See `docs/PHASE_6_COMPLETION_REPORT.md` for full implementation details.
