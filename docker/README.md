# Docker

This directory will contain all **Docker** and **Docker Compose** configuration files for containerizing the StockEase application.

## Planned Contents

- `Dockerfile` for the frontend (React + Vite)
- `Dockerfile` for the backend (Node.js + Express)
- `docker-compose.yml` for local multi-container orchestration
- `.dockerignore` files

## Planned Services (Docker Compose)

| Service | Image | Port |
|---------|-------|------|
| `frontend` | Custom React build | 3000 |
| `backend` | Custom Node.js build | 5000 |
| `mongodb` | `mongo:latest` | 27017 |

## Status

> ⏳ **Not yet implemented.** This directory is reserved for Phase 3 development.

Docker configuration will begin in **Phase 3: Docker and Docker Compose**.
