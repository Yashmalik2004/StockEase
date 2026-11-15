# PHASE 6 COMPLETION REPORT
## StockEase – Ansible Automation for Kubernetes Deployment

---

| Field | Details |
|---|---|
| **Project Name** | StockEase – Inventory Management System with DevOps Automation |
| **Phase** | Phase 6 – Ansible Automation |
| **Feature Branch** | `ansible-automation` |
| **Base Branch** | `origin/main` (commit `433f8b7`) |
| **Date Completed** | 15 November 2026 |
| **Repository** | https://github.com/Yashmalik2004/StockEase |
| **Final Status** | ✅ **COMPLETED AND RUNTIME VERIFIED** |

---

## 1. Executive Summary

Phase 6 implements automated orchestration of the StockEase Kubernetes deployment using **Ansible**. 

While Kubernetes natively manages pod scheduling, self-healing, and networking, deploying multi-tier applications with inter-service dependencies typically requires applying numerous manifests in a strict sequence, managing secrets safely, and polling workloads until readiness. 

Ansible bridges this operational gap by providing an idempotent, repeatable, single-command automation workflow that:
1. Validates cluster reachability and local prerequisite tools (`kubectl`, manifest directory, environment variables).
2. Deploys the StockEase namespace and ConfigMaps.
3. Injects the `stockease-secret` dynamically from the environment (`JWT_SECRET`) without ever committing credentials to Git.
4. Deploys the database tier (PVC, Deployment, Service) and explicitly blocks until the MongoDB readiness probe succeeds.
5. Deploys the API tier (Backend Deployment, Service) and blocks until the backend health probe passes.
6. Deploys the web tier (Frontend Deployment, NodePort Service) and verifies readiness.
7. Queries and displays the full state of all resources in the `stockease` namespace.

In addition, a standalone verification playbook (`playbooks/validate.yml`) allows continuous health auditing of the live cluster without re-applying resources.

---

## 2. Directory Structure & Files Created / Modified

```
StockEase/
├── ansible/
│   ├── ansible.cfg              # Ansible configuration (inventory path, default callback, retry disable)
│   ├── requirements.yml         # Ansible collection dependencies (ansible.builtin standard)
│   ├── README.md                # Comprehensive Phase 6 guide & troubleshooting
│   ├── inventory/
│   │   └── hosts.ini            # Control host definition (localhost execution of kubectl)
│   ├── group_vars/
│   │   └── all.yml              # Centralized configuration (namespace, timeouts, ports, paths)
│   └── playbooks/
│       ├── deploy.yml           # Primary orchestration playbook (preflight + 4 deployment stages)
│       └── validate.yml         # Standalone health verification playbook (22 validation tasks)
├── docs/
│   └── PHASE_6_COMPLETION_REPORT.md # This completion report
└── README.md                    # Updated roadmap marking Phase 6 complete
```

### Detailed File Manifest

| File | Type | Purpose |
|---|---|---|
| `ansible/ansible.cfg` | Config | Sets default inventory to `inventory/hosts.ini`, enables default callback with `result_format=yaml`, disables retry files, and sets localhost defaults. |
| `ansible/inventory/hosts.ini` | Inventory | Configures `localhost` with `ansible_connection=local` and `ansible_python_interpreter=/usr/bin/python3` to execute cluster commands directly. |
| `ansible/group_vars/all.yml` | Variables | Centralizes shared settings: `k8s_namespace: stockease`, manifest path, timeouts, image names, and default ports. |
| `ansible/playbooks/deploy.yml` | Playbook | 10 preflight tasks and 27 deployment tasks automating the ordered deployment with readiness waits and secret injection. |
| `ansible/playbooks/validate.yml` | Playbook | 22 tasks validating cluster connectivity, namespace state, MongoDB PVC state, Deployments rollout, Services existence, Pods ready state, backend `/api/health`, and frontend HTTP delivery. |
| `ansible/requirements.yml` | Config | Specifies collection dependencies (relies strictly on standard built-in modules). |
| `ansible/README.md` | Docs | Comprehensive instructions for WSL2/Ubuntu setup, secret handling, check mode, and troubleshooting. |
| `README.md` | Docs | Updated DevOps roadmap reflecting Phase 6 completion. |

---

## 3. Automation Architecture & Execution Workflow

The playbook reuses the existing, production-verified Kubernetes manifests located in `kubernetes/` without duplication:

```
                            [ Ansible Controller ]
                     (WSL2 Ubuntu / Linux / Container)
                                    │
                                    │ Reads: inventory/hosts.ini & group_vars/all.yml
                                    │ Reads env: JWT_SECRET
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │               Preflight Checks (deploy.yml)             │
       │  1. Check kubectl CLI availability                      │
       │  2. Test cluster-info connectivity                      │
       │  3. Verify all 10 manifests in kubernetes/ exist        │
       │  4. Validate JWT_SECRET is supplied in environment      │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Stage 1: Core Namespace & Config            │
       │  • Apply kubernetes/namespace.yaml (namespace: stockease│
       │  • Apply kubernetes/configmap.yaml (stockease-config)   │
       │  • Create/update stockease-secret dynamically via stdin │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Stage 2: Database Tier (MongoDB)            │
       │  • Apply kubernetes/mongodb-pvc.yaml (2Gi Bound)        │
       │  • Apply kubernetes/mongodb-deployment.yaml             │
       │  • Apply kubernetes/mongodb-service.yaml (ClusterIP)    │
       │  • Block: rollout status deployment/mongodb (120s max)  │
       │  • Verify: mongosh ping readiness condition             │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              Stage 3: Application API Tier              │
       │  • Apply kubernetes/backend-deployment.yaml             │
       │  • Apply kubernetes/backend-service.yaml (ClusterIP)    │
       │  • Block: rollout status deployment/backend (90s max)   │
       │  • Verify: HTTP /api/health probe readiness condition   │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │              Stage 4: Frontend Web Tier                 │
       │  • Apply kubernetes/frontend-deployment.yaml            │
       │  • Apply kubernetes/frontend-service.yaml (NodePort)    │
       │  • Block: rollout status deployment/frontend (60s max)  │
       │  • Verify: HTTP / probe readiness condition             │
       └────────────────────────────┬────────────────────────────┘
                                    │
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │             Stage 5: Final Health & Audit               │
       │  • Query: kubectl get all -n stockease                  │
       │  • Query: kubectl get pvc -n stockease                  │
       │  • Print access URL and summary banner                  │
       └─────────────────────────────────────────────────────────┘
```

---

## 4. Key Design Decisions & Security Considerations

### 4.1 Manifest Reuse (Zero Duplication)
Rather than defining Kubernetes resources inline inside Ansible YAML or duplicating them as Jinja2 templates, Ansible targets the canonical YAML manifests in `kubernetes/`. This guarantees parity between manual `kubectl` commands and automated Ansible executions.

### 4.2 Safe Dynamic Secret Management & True Idempotency
- `JWT_SECRET` is never written into git repositories or tracked files.
- The secret resolution order follows a robust hierarchy:
  1. Extra variable override: `-e jwt_secret_var=...`
  2. Environment variable: `lookup('env', 'JWT_SECRET')`
  3. Secure persistent file outside Git: `lookup('password', jwt_secret_file ~ ' length=64 chars=ascii_letters,digits')` targeting `~/.stockease/jwt_secret` (mode `0600`).
- If `~/.stockease/jwt_secret` does not exist, Ansible automatically generates a cryptographically secure 64-character secret and persists it outside the Git repository. On all subsequent executions, this exact secret is reused.
- **Root Cause & Technical Fix for Secret Idempotency (`changed=0`)**:
  - *Investigation*: Initially, deployment reruns showed `changed=1` due to two interrelated factors:
    1. *Dynamic Generation*: Prior runs generated a new random secret string in the CLI prior to invocation.
    2. *Kubernetes API `stringData` Behavior*: In Kubernetes Secrets, `stringData` is a write-only convenience field that is immediately converted to Base64 in `data` and deleted by the API server. When `kubectl apply` compares an input manifest with `stringData` against the live cluster object (which has only `data`), kubectl detects a key difference in the 3-way merge and always triggers a PATCH, outputting `secret/... configured`.
  - *Fix*: The Secret deployment task was updated to supply Base64-encoded `data`:
    ```yaml
    - name: "SECRET | Apply stockease-secret from JWT_SECRET"
      ansible.builtin.command: "{{ kubectl_bin }} apply -f -"
      args:
        stdin: |
          apiVersion: v1
          kind: Secret
          metadata:
            name: stockease-secret
            namespace: {{ k8s_namespace }}
            labels:
              app.kubernetes.io/name: stockease-secret
              app.kubernetes.io/part-of: stockease
          type: Opaque
          data:
            JWT_SECRET: "{{ jwt_secret | b64encode }}"
      no_log: true
      register: secret_apply_result
      changed_when: "'created' in secret_apply_result.stdout or 'configured' in secret_apply_result.stdout"
    ```
  - When the identical base64 payload is re-applied, `kubectl apply` reports `secret/stockease-secret unchanged`, and Ansible registers `changed=0`.
- All secret tasks enforce `no_log: true` to prevent credential exposure in terminal logs and audit artifacts.

### 4.3 Deterministic Dependency Ordering
In cloud-native architectures, starting backend pods before the database is ready causes crash-loop backoffs. The playbook enforces strict barriers:
- `rollout status deployment/mongodb` + `wait pod --for=condition=Ready` must succeed before `backend` manifests are applied.
- `rollout status deployment/backend` + `wait pod --for=condition=Ready` must succeed before `frontend` manifests are applied.

### 4.4 Windows & WSL2 Cross-Platform Execution Model
Ansible cannot run natively inside Windows PowerShell without third-party POSIX shims. The architecture cleanly separates the execution environment:
- The Kubernetes cluster runs on the Windows host (Minikube on Docker Desktop).
- Ansible runs in WSL2 (Ubuntu) accessing the host's `~/.kube/config`.

---

## 5. Verification & Testing Results (Static Analysis)

All playbooks, variable files, and configurations underwent automated structural verification:

| Check / Test | Command / Tool | Result | Status |
|---|---|---|:---:|
| **YAML Syntax: `requirements.yml`** | Python `yaml.safe_load` | Valid YAML structure | ✅ **PASS** |
| **YAML Syntax: `group_vars/all.yml`** | Python `yaml.safe_load` | Valid YAML structure; 12 variables defined | ✅ **PASS** |
| **YAML Syntax: `playbooks/deploy.yml`** | Python `yaml.safe_load` | Valid YAML structure; 10 pre_tasks, 27 tasks | ✅ **PASS** |
| **YAML Syntax: `playbooks/validate.yml`** | Python `yaml.safe_load` | Valid YAML structure; 22 tasks | ✅ **PASS** |
| **Inventory Syntax: `inventory/hosts.ini`** | INI Parser validation | Group `k8s_control`, host `localhost` valid | ✅ **PASS** |
| **Configuration: `ansible.cfg`** | Config Parser validation | Paths, callbacks, timeout correctly formatted | ✅ **PASS** |
| **Referenced Manifest Existence** | Preflight automated check | All 10 files in `kubernetes/` confirmed present | ✅ **PASS** |
| **Zero Plaintext Secrets Check** | Git diff & regex scan | No JWT secret, token, or password committed | ✅ **PASS** |

---

## 6. How to Execute

### 6.1 Prerequisites
1. Minikube running with Docker driver:
   ```bash
   minikube status
   ```
2. Container images built and loaded into Minikube:
   ```bash
   minikube image build -t stockease-backend:latest ./backend
   minikube image build -t stockease-frontend:latest ./frontend
   ```

### 6.2 Execution from WSL2 (Ubuntu)
```bash
# Navigate to the ansible directory
cd /mnt/c/Users/YASH/Desktop/projects/StockEase/ansible

# Export required secret
export JWT_SECRET=$(openssl rand -hex 32)
export ANSIBLE_CONFIG=/mnt/c/Users/YASH/Desktop/projects/StockEase/ansible/ansible.cfg

# Syntax check
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --syntax-check
ansible-playbook -i inventory/hosts.ini playbooks/validate.yml --syntax-check

# Dry-run / Check mode
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml --check

# Full deployment
ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml

# Health validation
ansible-playbook -i inventory/hosts.ini playbooks/validate.yml
```

---

## 7. Git Workflow Details

- **Branch:** `ansible-automation`
- **Base Commit:** `433f8b7` (Merge pull request #5 from Yashmalik2004/kubernetes-orchestration)
- **Commit History:**
  - `c64e8d3` — `docs(phase-6): record commit hash and branch URL in completion report`
  - `2d7fd0d` — `feat: implement Ansible automation for Kubernetes deployment (Phase 6)`
- **Remote Branch URL:** https://github.com/Yashmalik2004/StockEase/tree/ansible-automation
- **Files Modified / Staged:**
  - `ansible/ansible.cfg`
  - `ansible/requirements.yml`
  - `ansible/inventory/hosts.ini`
  - `ansible/group_vars/all.yml`
  - `ansible/playbooks/deploy.yml`
  - `ansible/playbooks/validate.yml`
  - `ansible/README.md`
  - `docs/PHASE_6_COMPLETION_REPORT.md`
  - `README.md`
- **Security Check:** Zero `.env` files or credentials staged or tracked.

---

## 8. Initial Static Status

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   PHASE 6 STATUS:  ✅ COMPLETED                                      ║
║                                                                      ║
║   Ansible Configuration & Inventory:     ✅  CONFIGURED & VALIDATED  ║
║   Manifest Reuse (Zero Duplication):     ✅  VERIFIED (10 FILES)     ║
║   Preflight & Environment Checks:        ✅  IMPLEMENTED             ║
║   Dynamic Secret Management:             ✅  SAFE (NO SECRETS IN GIT)║
║   Ordered Deployment Playbook:           ✅  37 TASKS READY          ║
║   Standalone Validation Playbook:        ✅  22 TASKS READY          ║
║   Static YAML & Semantic Validation:     ✅  100% PASS               ║
║   Documentation & Troubleshooting:       ✅  COMPLETE                ║
║                                                                      ║
║   StockEase is ready for automated Kubernetes deployment via Ansible.║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 9. Runtime Deployment and Validation Results

### 9.1 Project and Runtime Environment

| Property | Value |
|---|---|
| **Project Name** | StockEase – Inventory Management System with DevOps Automation |
| **Operating Environment** | Ubuntu 26.04 LTS running on Windows 11 WSL2 |
| **Ansible Version** | `core 2.20.1` (Python 3.14.4, Jinja 3.1.6, PyYAML 6.0.3) |
| **Kubectl Client Version** | `v1.36.1` (Kustomize v5.8.1) |
| **Minikube Version** | `v1.39.0` (commit `7a9f6a84`) |
| **Kubernetes Cluster Version**| `v1.37.0` on containerd `2.3.4` (Docker driver) |
| **Cluster Node** | `minikube` (Control Plane, Status: Ready, IP: 192.168.49.2) |
| **Working Directory** | `/mnt/c/Users/YASH/Desktop/projects/StockEase` |

### 9.2 Commands Executed During Audit and Validation

1. **Environment Verification:**
   ```bash
   ansible --version
   kubectl version --client
   minikube status
   kubectl get nodes -o wide
   kubectl get pods -A
   ```
2. **Dependency & Inventory Checks:**
   ```bash
   ansible-galaxy collection install -r ansible/requirements.yml
   ansible-inventory -i ansible/inventory/hosts.ini --list
   ansible-config dump --only-changed
   ansible all -i ansible/inventory/hosts.ini -m ping
   ```
3. **Syntax Checks:**
   ```bash
   ansible-playbook -i ansible/inventory/hosts.ini --syntax-check ansible/playbooks/deploy.yml
   ansible-playbook -i ansible/inventory/hosts.ini --syntax-check ansible/playbooks/validate.yml
   ```
4. **Image Building & Loading (Minikube internal builder):**
   ```bash
   minikube image build -t stockease-backend:latest ./backend
   minikube image build -t stockease-frontend:latest ./frontend
   minikube image ls | grep stockease
   ```
5. **Ansible Deployment (Run 1 – Applying Persisted Secret from Store):**
   ```bash
   export ANSIBLE_CONFIG=/mnt/c/Users/YASH/Desktop/projects/StockEase/ansible/ansible.cfg
   unset JWT_SECRET
   ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml
   ```
6. **Ansible Deployment (Run 2 – 100% Idempotency Verification):**
   ```bash
   export ANSIBLE_CONFIG=/mnt/c/Users/YASH/Desktop/projects/StockEase/ansible/ansible.cfg
   unset JWT_SECRET
   ansible-playbook -i inventory/hosts.ini playbooks/deploy.yml
   ```
7. **Ansible Validation Playbook:**
   ```bash
   export ANSIBLE_CONFIG=/mnt/c/Users/YASH/Desktop/projects/StockEase/ansible/ansible.cfg
   ansible-playbook -i inventory/hosts.ini playbooks/validate.yml
   ```
8. **End-to-End Application Smoke Test:**
   ```bash
   # Multi-tier registration, login, token acquisition, product CRUD, stats, deletion via frontend Nginx proxy
   sh ansible/smoke_test.sh
   ```

### 9.3 Test Results Matrix

| Test | Expected Result | Actual Result | Status |
|---|---|---|:---:|
| **Ansible Installation** | Core 2.20.1 available in WSL2 | `ansible [core 2.20.1]` detected | ✅ **PASS** |
| **Inventory Validation** | Host `localhost` in `k8s_control` group | Parsed successfully via `ansible-inventory` | ✅ **PASS** |
| **Ansible Connectivity** | `ping` returns `pong` | `localhost \| SUCCESS => { "ping": "pong" }` | ✅ **PASS** |
| **Deployment Syntax** | Syntax check passes | `playbook: playbooks/deploy.yml` OK | ✅ **PASS** |
| **Validation Syntax** | Syntax check passes | `playbook: playbooks/validate.yml` OK | ✅ **PASS** |
| **Image Availability** | Images cached in Minikube containerd | `stockease-backend:latest` & `stockease-frontend:latest` present | ✅ **PASS** |
| **Ansible Deployment** | Clean execution of all stages | `ok=35 changed=1 failed=0` (initial secret sync) | ✅ **PASS** |
| **Deployment Idempotency** | Second deploy produces zero state mutations | `ok=35 changed=0 failed=0` (100% True Idempotency) | ✅ **PASS** |
| **PVC Validation** | `mongodb-pvc` in `Bound` phase | `mongodb-pvc Bound 2Gi RWO standard` | ✅ **PASS** |
| **MongoDB Readiness** | Pod reaches `Ready` | `pod/mongodb-58fb854968-ztsr8 1/1 Running` | ✅ **PASS** |
| **Backend Readiness** | Pod reaches `Ready` | `pod/backend-7c48c598d-wvdcq 1/1 Running` | ✅ **PASS** |
| **Frontend Readiness** | Pod reaches `Ready` | `pod/frontend-59b4d596df-vw6mv 1/1 Running` | ✅ **PASS** |
| **Service Validation** | ClusterIP & NodePort active | `mongodb` (27017), `backend` (5000), `frontend` (30080) OK | ✅ **PASS** |
| **Backend Health** | `/api/health` returns status ok | `{"status":"ok","message":"StockEase API is running."}` | ✅ **PASS** |
| **Frontend Accessibility**| Serves index.html bundle (status 200) | `StockEase – Inventory Management` title confirmed | ✅ **PASS** |
| **API Smoke Test** | Full auth, product CRUD, stats via proxy | Registered admin, created item, queried stats, deleted item | ✅ **PASS** |
| **Secret Protection** | Zero credentials logged or committed | `no_log: true` active on secret tasks, `~/.stockease` outside repo | ✅ **PASS** |

### 9.4 Errors Diagnosed and Resolved

| Error / Challenge | Root Cause | Exact Resolution | Retest Result |
|---|---|---|---|
| `requirements.yml` failed galaxy install (`ansible.builtin:*`) | `ansible.builtin` is part of core and cannot be installed via Galaxy | Changed `requirements.yml` to specify `collections: []` with explanatory docs | `ansible-galaxy` succeeded cleanly |
| World-writable directory warning for `ansible.cfg` | WSL NTFS mount `/mnt/c` has 777 permissions | Explicitly exported `ANSIBLE_CONFIG=/mnt/c/.../ansible.cfg` | Config loaded with 0 warnings |
| `yaml` callback plugin removed in Ansible 2.20 | Ansible-core 2.20 deprecated `stdout_callback = yaml` in favor of default with `result_format = yaml` | Updated `ansible.cfg` to use `stdout_callback = default` and `[callback_default] result_format = yaml` | Callback formatted output as YAML without errors |
| Relative path to manifests `../kubernetes` not found | Playbook directory `playbooks/` required `../../kubernetes` to reach repo root | Updated `group_vars/all.yml` with `{{ playbook_dir }}/../../kubernetes` and removed duplicate inventory var | Stat checks verified all 10 manifests |
| `group_vars` not auto-discovered | `group_vars/` was at `ansible/group_vars/` rather than inside `playbooks/` | Added `vars_files: - "{{ playbook_dir }}/../group_vars/all.yml"` to both playbooks | Variables resolved accurately across all tasks |
| Secret task failed with heredoc `cat <<'EOF'` | Folded block `>` collapsed heredoc into single line | Refactored task to `ansible.builtin.command: "{{ kubectl_bin }} apply -f -"` with `args.stdin` and `no_log: true` | Secret created and updated cleanly |
| Frontend `wget http://localhost:80/` refused | Alpine Linux resolves `localhost` to `::1` (IPv6), but Nginx only listened on `0.0.0.0:80` | Updated health check in `validate.yml` to `http://127.0.0.1:80/` | HTTP status 200 and HTML bundle confirmed |
| Laptop shutdown stopped Minikube | Host machine rebooted during execution | Restarted cluster safely via `minikube start --driver=docker` without data loss | All pods restored and verified healthy |
| Secret task reported `changed=1` on subsequent runs | 1) Dynamic CLI invocation regenerated secret on every run; 2) `stringData` in manifest is stripped by K8s API server upon conversion to `data`, causing `kubectl apply` 3-way merge to always detect diff and issue PATCH | 1) Persisted development secret in `~/.stockease/jwt_secret` (mode `0600`) outside repo; 2) Updated Secret manifest to use Base64 `data: {JWT_SECRET: "{{ jwt_secret \| b64encode }}"}` | Second run produced `secret/stockease-secret unchanged`, resulting in `ok=35 changed=0 failed=0` |

### 9.5 Security Verification

1. **Zero Hardcoded Secrets**: No passwords, tokens, or JWT secrets exist in `deploy.yml`, `group_vars/all.yml`, or `inventory/hosts.ini`.
2. **Persistent Secure Store Outside Repo**: Secrets are stored in `~/.stockease/jwt_secret` with mode `0600`, strictly outside git scope.
3. **Secret Resolution Hierarchy**: Extra-vars (`-e jwt_secret_var=...`) → Environment variable (`JWT_SECRET`) → Persistent file (`lookup('password', ...)`).
4. **Censored Logging**: The secret application task explicitly uses `no_log: true`, preventing sensitive values from appearing in logs or terminal outputs.
5. **Git Protection**: Verified via `git status` that `.env` and sensitive files remain completely ignored and uncommitted.

### 9.6 Runtime Evidence

#### Workloads & Services Status (`kubectl get all -n stockease`):
```text
NAME                            READY   STATUS    RESTARTS      AGE   IP           NODE       NOMINATED NODE   READINESS GATES
pod/backend-7c48c598d-wvdcq     1/1     Running   2 (16m ago)   28m   10.244.0.3   minikube   <none>           <none>
pod/frontend-59b4d596df-vw6mv   1/1     Running   3 (16m ago)   27m   10.244.0.5   minikube   <none>           <none>
pod/mongodb-58fb854968-ztsr8    1/1     Running   1 (17m ago)   29m   10.244.0.4   minikube   <none>           <none>

NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE   SELECTOR
service/backend    ClusterIP   10.101.49.86    <none>        5000/TCP       28m   app=backend
service/frontend   NodePort    10.109.157.4    <none>        80:30080/TCP   27m   app=frontend
service/mongodb    ClusterIP   10.109.242.83   <none>        27017/TCP      29m   app=mongodb

NAME                       READY   UP-TO-DATE   AVAILABLE   AGE   CONTAINERS   IMAGES                      SELECTOR
deployment.apps/backend    1/1     1            1           28m   backend      stockease-backend:latest    app=backend
deployment.apps/frontend   1/1     1            1           27m   frontend     stockease-frontend:latest   app=frontend
deployment.apps/mongodb    1/1     1            1           29m   mongodb      mongo:7.0                   app=mongodb

NAME                                  DESIRED   CURRENT   READY   AGE   CONTAINERS   IMAGES                      SELECTOR
replicaset.apps/backend-7c48c598d     1         1         1       28m   backend      stockease-backend:latest    app=backend,pod-template-hash=7c48c598d
replicaset.apps/frontend-59b4d596df   1         1         1       27m   frontend     stockease-frontend:latest   app=frontend,pod-template-hash=59b4d596df
replicaset.apps/mongodb-58fb854968    1         1         1       29m   mongodb      mongo:7.0                   app=mongodb,pod-template-hash=58fb854968
```

#### Persistent Volume Claim (`kubectl get pvc -n stockease`):
```text
NAME          STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
mongodb-pvc   Bound    pvc-a9ae26c0-4af0-4a81-bd43-ffb1705f893e   2Gi        RWO            standard       29m
```

#### Ansible Deployment Playbook Run 1 (Initial Secret Sync):
```text
PLAY RECAP *********************************************************************
localhost                  : ok=35   changed=1    unreachable=0    failed=0    skipped=4    rescued=0    ignored=0
```

#### Ansible Deployment Playbook Run 2 (100% True Idempotency):
```text
PLAY RECAP *********************************************************************
localhost                  : ok=35   changed=0    unreachable=0    failed=0    skipped=4    rescued=0    ignored=0
```

#### Ansible Validation Playbook Run:
```text
PLAY RECAP *********************************************************************
localhost                  : ok=22   changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0
```

#### Application End-to-End Smoke Test Output:
```text
=========================================
StockEase End-to-End Application Smoke Test
=========================================
[1/6] Registering test user: smoketest_1794724864...
Registration Response: {"message":"Admin registered successfully.","token":"eyJhbGciOiJIUzI1NiIs...","admin":{"id":"6af95400a24f96960bc2f042","username":"smoketest_1794724864","email":"smoke_1794724864@example.com","createdAt":"2026-11-15T06:41:04.862Z"}}
[2/6] Logging in to acquire JWT auth token (/api/auth/login)...
Login Response: {"message":"Login successful.","token":"eyJhbGciOiJIUzI1NiIs...","admin":{"id":"6af95400a24f96960bc2f042","username":"smoketest_1794724864","email":"smoke_1794724864@example.com","createdAt":"2026-11-15T06:41:04.862Z"}}
JWT Token successfully verified (length: 268 chars).
[3/6] Querying initial dashboard stats (/api/dashboard/stats)...
Dashboard Stats Response: {"stats":{"totalProducts":2,"totalQuantity":50,"totalValue":2499.5,"lowStockCount":0,"outOfStockCount":0,"recentProducts":[...]}}
[4/6] Creating test inventory product (/api/products)...
Create Product Response: {"message":"Product created successfully.","product":{"name":"DevOps Book 1794724864","description":"","category":"Books","price":49.99,"quantity":25,"sku":"DEVOPS-1794724864","lowStockThreshold":5,"_id":"6af95403a24f96960bc2f04a",...}}
Product created successfully with ID: 6af95403a24f96960bc2f04a
[5/6] Querying products list (/api/products)...
Products List Response: {"count":3,"products":[{"_id":"6af95403a24f96960bc2f04a","name":"DevOps Book 1794724864","description":"","category":"Books","price":49.99,"quantity":25,"sku":"DEVOPS-1794724864",...},...]}
[6/6] Deleting test product (/api/products/6af95403a24f96960bc2f04a)...
Delete Response: {"message":"Product deleted successfully.","deletedId":"6af95403a24f96960bc2f04a"}
=========================================
ALL APPLICATION SMOKE TESTS PASSED!
=========================================
```

### 9.7 Final Verdict

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   FINAL VERDICT:  ✅ COMPLETED AND RUNTIME VERIFIED                  ║
║                                                                      ║
║   Cluster Infrastructure:         ✅ Minikube v1.39.0 / K8s v1.37.0  ║
║   Local Image Containerization:   ✅ Cached in containerd (Backend/UI║
║   Ansible Deployment Playbook:    ✅ 35 Tasks (ok=35, changed=0)     ║
║   Ansible Validation Playbook:    ✅ 22 Tasks (ok=22, changed=0)     ║
║   All Kubernetes Pods:            ✅ 1/1 Running (MongoDB/API/UI)    ║
║   Persistent Volume:              ✅ 2Gi Volume Bound                ║
║   Nginx Reverse Proxy & Backend:  ✅ /api/health responding HTTP 200 ║
║   End-to-End Application CRUD:    ✅ 100% Verified via REST API      ║
║   Deployment Idempotency:         ✅ 100% Verified (changed=0)       ║
║   Secret Protection:              ✅ Persistent file mode 0600 +     ║
║                                      no_log: true (Zero leakage)     ║
║                                                                      ║
║   Phase 6 is fully complete, hardened, and verified at runtime.      ║
╚══════════════════════════════════════════════════════════════════════╝
```
