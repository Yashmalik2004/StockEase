# ==============================================================================
# StockEase Backend Dockerfile
# Production-ready Node.js container
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install curl for healthcheck or troubleshooting
RUN apk --no-cache add curl

# Copy dependency manifests first for optimal Docker layer caching
COPY package*.json ./

# Install production dependencies only using package-lock.json
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server using production node command
CMD ["node", "server.js"]
