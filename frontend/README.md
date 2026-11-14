# Frontend – StockEase Admin Dashboard

This directory contains the **React.js + Vite** frontend for StockEase.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI component library |
| Vite | 5.x | Build tool and dev server |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client for API calls |
| Lucide React | 0.294+ | Icon library |

## Prerequisites

- Node.js 18 or higher
- Backend server running on port 5000

## Installation

```bash
cd frontend
npm install
```

## Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

**`.env` variables:**

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:5000` | Backend API base URL |

## Running the Dev Server

```bash
npm run dev
```

The app opens on **http://localhost:5173**

## Building for Production

```bash
npm run build
```

Output is placed in `dist/`.

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|:---:|-------------|
| `/login` | Login | ❌ | Admin sign-in form |
| `/register` | Register | ❌ | Admin registration form |
| `/dashboard` | Dashboard | ✅ | Inventory stats overview |
| `/products` | Products | ✅ | Full product list with search/filter |
| `/products/add` | Add Product | ✅ | Create a new product |
| `/products/edit/:id` | Edit Product | ✅ | Edit an existing product |
| `/` | — | — | Redirects to `/dashboard` |

## Project Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
└── src/
    ├── App.jsx                      # Router and route definitions
    ├── main.jsx                     # React app entry point
    ├── index.css                    # Tailwind directives + global styles
    ├── api/
    │   └── axios.js                 # Centralised Axios instance with JWT interceptor
    ├── context/
    │   └── AuthContext.jsx          # Auth state provider (login, logout, isAuthenticated)
    ├── components/
    │   ├── Layout.jsx               # Sidebar + main content shell
    │   ├── Sidebar.jsx              # Navigation sidebar
    │   ├── Navbar.jsx               # Top bar with page title
    │   ├── ProtectedRoute.jsx       # Redirect to /login if unauthenticated
    │   ├── StatsCard.jsx            # Dashboard statistic card
    │   ├── ProductTable.jsx         # Sortable product table with actions
    │   └── Toast.jsx                # Auto-dismissing notification
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        ├── Dashboard.jsx
        ├── Products.jsx
        ├── AddProduct.jsx
        └── EditProduct.jsx
```
