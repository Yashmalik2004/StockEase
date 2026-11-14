# Backend – StockEase API Server

This directory contains the **Node.js + Express.js** REST API for StockEase.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| Express.js | 4.x | HTTP server framework |
| MongoDB | 7.x | NoSQL database |
| Mongoose | 8.x | MongoDB ODM |
| bcryptjs | 2.x | Password hashing |
| jsonwebtoken | 9.x | JWT authentication |
| dotenv | 16.x | Environment variable loading |
| cors | 2.x | Cross-origin resource sharing |
| nodemon | 3.x | Development auto-reload |

## Prerequisites

- Node.js 18 or higher
- MongoDB running locally (or MongoDB Atlas URI)

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

**`.env` variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | API server port |
| `MONGO_URI` | `mongodb://localhost:27017/stockease` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for signing JWTs (use a long random string) |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiry |
| `FRONTEND_URL` | `http://localhost:5173` | CORS allowed origin |

## Running the Server

```bash
# Development (auto-reload on file changes)
npm run dev

# Production
npm start
```

The server starts on **http://localhost:5000**

## API Endpoints

### Authentication

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| POST | `/api/auth/register` | ❌ | Register a new admin |
| POST | `/api/auth/login` | ❌ | Admin login, returns JWT |

### Products

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/api/products` | ✅ | List all products (supports `?search=`, `?category=`, `?stockStatus=`) |
| POST | `/api/products` | ✅ | Create a new product |
| GET | `/api/products/:id` | ✅ | Get a single product by ID |
| PUT | `/api/products/:id` | ✅ | Update a product |
| DELETE | `/api/products/:id` | ✅ | Delete a product |

### Dashboard

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/api/dashboard/stats` | ✅ | Returns inventory statistics |

### Health Check

| Method | Endpoint | Auth Required | Description |
|--------|----------|:---:|-------------|
| GET | `/api/health` | ❌ | Server health check |

## Authentication

Protected endpoints require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained from `/api/auth/login` or `/api/auth/register`.

## Project Structure

```
backend/
├── server.js                    # Express app entry point
├── package.json
├── .env.example                 # Environment variable template
├── config/
│   └── db.js                    # MongoDB connection
├── models/
│   ├── Admin.js                 # Admin Mongoose model
│   └── Product.js               # Product Mongoose model
├── middleware/
│   └── auth.js                  # JWT authentication middleware
├── routes/
│   ├── auth.js                  # Auth routes
│   ├── products.js              # Product routes
│   └── dashboard.js             # Dashboard routes
└── controllers/
    ├── authController.js        # Auth business logic
    ├── productController.js     # Product CRUD logic
    └── dashboardController.js   # Dashboard stats logic
```
