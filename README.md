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

## 🚀 Implemented Application Features (Phase 2)

| # | Feature | Status |
|---|---------|:------:|
| 1 | **Admin Registration** | ✅ Complete |
| 2 | **Admin Login** | ✅ Complete |
| 3 | **JWT Authentication** | ✅ Complete |
| 4 | **Add Products** | ✅ Complete |
| 5 | **View Products** | ✅ Complete |
| 6 | **Update Product Information** | ✅ Complete |
| 7 | **Delete Products** | ✅ Complete |
| 8 | **Manage Stock Quantities** | ✅ Complete |
| 9 | **Search Products** | ✅ Complete |
| 10 | **Filter by Category** | ✅ Complete |
| 11 | **Low-Stock Alerts** | ✅ Complete |
| 12 | **Dashboard Statistics** | ✅ Complete |
| 13 | **Responsive Admin UI** | ✅ Complete |

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
| **Containerization** | Docker | ⏳ Planned (Phase 3) | Multi-stage image build and container packaging |
| **CI/CD** | GitHub Actions | ⏳ Planned (Phase 4) | Automated build, test, and container scanning |
| **Orchestration** | Kubernetes | ⏳ Planned (Phase 5) | Cluster deployment, scaling, and self-healing |
| **Automation** | Ansible | ⏳ Planned (Phase 6) | Automated server configuration management |
| **Monitoring** | Prometheus | ⏳ Planned (Phase 7) | Real-time metric collection and monitoring |
| **Security Scanning** | Trivy | ⏳ Planned (Phase 7) | Container image vulnerability analysis |

---

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally on port 27017 (or MongoDB Atlas URI)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Yashmalik2004/StockEase.git
cd StockEase
```

### 2. Configure and Start Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

Backend API server starts on **http://localhost:5000**

### 3. Configure and Start Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend UI starts on **http://localhost:5173**

### 4. (Optional) Populate Sample Inventory

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
│   └── src/
│       ├── api/        # Axios API client
│       ├── components/ # Reusable UI components
│       ├── context/    # React Context (Auth)
│       └── pages/      # Login, Register, Dashboard, Products, Add/Edit
│
├── backend/            # Node.js + Express.js API server
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Route handler logic
│   ├── middleware/     # JWT auth middleware
│   ├── models/         # Mongoose models (Admin, Product)
│   └── routes/         # Express routers
│
├── database/           # MongoDB schema docs + seed script
├── docker/             # Docker configuration (Phase 3)
├── kubernetes/         # Kubernetes manifests (Phase 5)
├── ansible/            # Ansible playbooks (Phase 6)
├── monitoring/         # Prometheus configuration (Phase 7)
├── .github/workflows/  # GitHub Actions CI/CD (Phase 4)
├── docs/               # Phase completion reports
├── .env.example        # Root environment variable template
├── .gitignore
└── README.md
```

---

## 🗺️ Development Roadmap

| Phase | Title | Status |
|-------|-------|:------:|
| **Phase 1** | Project Initialization and GitHub Setup | ✅ Complete |
| **Phase 2** | Frontend, Backend and MongoDB Development | ✅ Complete |
| **Phase 3** | Docker and Docker Compose | ⏳ Planned |
| **Phase 4** | GitHub Actions CI/CD Pipeline | ⏳ Planned |
| **Phase 5** | Kubernetes Deployment | ⏳ Planned |
| **Phase 6** | Ansible Automation | ⏳ Planned |
| **Phase 7** | Monitoring and Security | ⏳ Planned |
| **Phase 8** | Testing, Documentation and Final Demonstration | ⏳ Planned |

---

## 📄 License

This project is developed for academic purposes as part of a university DevOps Capstone Project.

---

## 👨‍💻 Author

**Yash Malik**  
GitHub: [@Yashmalik2004](https://github.com/Yashmalik2004)
