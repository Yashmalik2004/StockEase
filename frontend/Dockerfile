# ==============================================================================
# StockEase Frontend Dockerfile
# Multi-stage production build (Node.js build -> Nginx serve)
# ==============================================================================

# Stage 1: Build production React/Vite assets
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm ci

# Copy frontend source files
COPY . .

# Build argument for API base URL (empty or "/" allows Nginx reverse proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Build static bundle for production
RUN npm run build

# Stage 2: Serve production bundle with lightweight Nginx web server
FROM nginx:alpine

# Copy built static files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration (SPA routing + /api reverse proxy)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
