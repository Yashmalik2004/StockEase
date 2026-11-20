
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN apk --no-cache add curl

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .
EXPOSE 5000

# Start server using production node command
CMD ["node", "server.js"]
