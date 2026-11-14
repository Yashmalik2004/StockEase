# Docker Containerization – StockEase

This directory documents the **Docker** and **Docker Compose** containerization architecture for StockEase.

## Architecture Overview

StockEase uses a multi-container architecture orchestrated with Docker Compose:

```
                      ┌───────────────────────────────────────┐
                      │             Client Browser            │
                      └──────────────────┬────────────────────┘
                                         │
                         HTTP Port 3000  │  (Frontend UI & /api proxy)
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

## Services Summary

| Service | Container Name | Base Image | Internal Port | Host Port | Purpose |
|---------|----------------|------------|---------------|-----------|---------|
| `frontend` | `stockease-frontend` | `nginx:alpine` | 80 | 3000 | Production React build served with Nginx reverse proxy |
| `backend` | `stockease-backend` | `node:20-alpine` | 5000 | 5000 | Express API connected to MongoDB container |
| `mongodb` | `stockease-mongodb` | `mongo:7.0` | 27017 | — | Dedicated database with persistent storage |

## Quick Start

```bash
# Build and start all services in background
docker compose up --build -d

# View status of services
docker compose ps

# View live container logs
docker compose logs -f

# Stop services (preserves database volume)
docker compose down

# Stop services and remove persistent volume (complete reset)
docker compose down -v
```
