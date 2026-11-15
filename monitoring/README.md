# StockEase Monitoring — Prometheus

This directory contains all Prometheus monitoring configuration for StockEase Phase 7.

---

## Overview

Prometheus is integrated into StockEase to collect and store metrics from the Node.js/Express backend. The setup covers both **Docker Compose** (local development) and **Kubernetes** (production) deployments.

### What's Implemented

| Component | File |
|---|---|
| prom-client integration | `backend/server.js`, `backend/package.json` |
| Prometheus scrape config (Docker Compose / K8s) | `monitoring/prometheus/prometheus.yml` |
| Alert rules | `monitoring/prometheus/alert_rules.yml` |
| Kubernetes ConfigMap | `monitoring/kubernetes/prometheus-configmap.yaml` |
| Kubernetes Deployment | `monitoring/kubernetes/prometheus-deployment.yaml` |
| Kubernetes Service (NodePort 30090) | `monitoring/kubernetes/prometheus-service.yaml` |

---

## Metrics Collected

### Default Node.js Metrics (via `collectDefaultMetrics`)

All default metrics are prefixed with `stockease_`:

- `stockease_process_cpu_seconds_total` — CPU usage
- `stockease_process_resident_memory_bytes` — Memory usage
- `stockease_process_open_fds` — Open file descriptors
- `stockease_nodejs_eventloop_lag_seconds` — Event loop lag
- `stockease_nodejs_heap_size_total_bytes` — V8 heap total
- `stockease_nodejs_heap_size_used_bytes` — V8 heap used
- `stockease_nodejs_gc_duration_seconds` — Garbage collection duration
- `stockease_nodejs_active_handles_total` — Active libuv handles

### Custom Application Metrics

| Metric | Type | Labels | Description |
|---|---|---|---|
| `stockease_http_requests_total` | Counter | `method`, `route`, `status_code` | Total HTTP requests processed |
| `stockease_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` | HTTP request latency (buckets: 1ms–5s) |
| `stockease_active_requests` | Gauge | — | Currently in-flight HTTP requests |

---

## Architecture

```
                    +------------------------------+
                    |      Prometheus Server       |
                    |      prom/prometheus:v2.51.2 |
                    |      scrape every 10s        |
                    +-------------+----------------+
                                  | GET /metrics
                                  v
                    +------------------------------+
                    |  StockEase Backend (Express) |
                    |  port 5000                   |
                    |  /metrics -- prom-client     |
                    +------------------------------+
```

**Scrape flow:**
1. Prometheus scrapes `GET /metrics` on the backend every 10 seconds.
2. The `/metrics` endpoint (added in `backend/server.js`) uses `prom-client` to expose metrics in the Prometheus text format.
3. A middleware intercepts every request to record counters, histograms, and gauge values.
4. Alerting rules in `alert_rules.yml` are evaluated every 30 seconds.

---

## Access Instructions

### Docker Compose

> NOTE: The `prometheus.yml` scrape target is `backend:5000`, which resolves to the Docker Compose service name `backend` within the `stockease-network`. This works because the backend service is named `backend` in `docker-compose.yml`.

```bash
# Start all services including Prometheus
docker compose up -d

# Access Prometheus UI
open http://localhost:9090

# Access backend metrics directly
curl http://localhost:5001/metrics
```

> NOTE: If you run Prometheus standalone (outside Docker Compose), change the scrape target in `prometheus.yml` from `backend:5000` to `stockease-backend:5000` (the Docker container name) or `localhost:5001` (using the host-mapped port).

### Kubernetes

```bash
# Apply monitoring manifests
kubectl apply -f monitoring/kubernetes/prometheus-configmap.yaml
kubectl apply -f monitoring/kubernetes/prometheus-deployment.yaml
kubectl apply -f monitoring/kubernetes/prometheus-service.yaml

# Access Prometheus UI via NodePort
open http://<node-ip>:30090

# Check Prometheus pod status
kubectl get pods -n stockease -l app=prometheus

# Check backend metrics from within the cluster
kubectl exec -n stockease -it <backend-pod> -- wget -qO- http://backend:5000/metrics
```

---

## Useful PromQL Queries

```promql
# Request rate over last 5 minutes (all routes)
rate(stockease_http_requests_total[5m])

# 95th percentile request latency
histogram_quantile(0.95, rate(stockease_http_request_duration_seconds_bucket[5m]))

# Error rate (5xx responses as fraction of total)
rate(stockease_http_requests_total{status_code=~"5.."}[5m])
  / rate(stockease_http_requests_total[5m])

# Current active (in-flight) requests
stockease_active_requests

# Top slow routes (p95 latency by route)
histogram_quantile(0.95,
  sum(rate(stockease_http_request_duration_seconds_bucket[5m])) by (le, route)
)

# Request rate by HTTP method
sum by (method) (rate(stockease_http_requests_total[5m]))

# Memory usage (RSS)
stockease_process_resident_memory_bytes

# Node.js heap used
stockease_nodejs_heap_size_used_bytes

# Event loop lag
stockease_nodejs_eventloop_lag_seconds
```

---

## Alert Rules

| Alert | Severity | Condition | For |
|---|---|---|---|
| `BackendDown` | critical | Backend scrape target is unreachable (`up == 0`) | 1 minute |
| `HighErrorRate` | warning | >5% of requests returning 5xx errors | 2 minutes |
| `HighRequestLatency` | warning | p95 latency >1 second | 2 minutes |
| `HighActiveRequests` | warning | >100 concurrent active requests | 1 minute |

---

## Deployment Steps

### Docker Compose (Full Stack)

```bash
# 1. Build and start all services
docker compose up -d --build

# 2. Verify backend exposes metrics
curl http://localhost:5001/metrics | head -20

# 3. Open Prometheus and check targets
open http://localhost:9090/targets
# stockease-backend should show State: UP

# 4. Check alerts
open http://localhost:9090/alerts
```

### Kubernetes

```bash
# 1. Ensure namespace exists
kubectl get namespace stockease

# 2. Build and push backend image (prom-client is now included)
docker build -t stockease-backend:latest ./backend

# 3. Apply monitoring stack
kubectl apply -f monitoring/kubernetes/

# 4. Wait for Prometheus pod to be ready
kubectl rollout status deployment/prometheus -n stockease

# 5. Port-forward to test locally (alternative to NodePort)
kubectl port-forward svc/prometheus 9090:9090 -n stockease
open http://localhost:9090

# 6. Verify backend target is scraped
# Navigate to http://localhost:9090/targets
# Look for job="stockease-backend" with State: UP
```

---

## File Structure

```
monitoring/
├── README.md                          # This file
├── prometheus/
│   ├── prometheus.yml                 # Scrape config (Docker Compose & K8s compatible)
│   └── alert_rules.yml               # Alerting rules
└── kubernetes/
    ├── prometheus-configmap.yaml      # K8s ConfigMap with embedded configs
    ├── prometheus-deployment.yaml     # K8s Deployment (prom/prometheus:v2.51.2)
    └── prometheus-service.yaml        # K8s NodePort Service (port 30090)
```
