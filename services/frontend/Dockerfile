# ==========================================
# Stage 1: Build React Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY services/frontend/package.json ./package.json
COPY services/frontend/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install

# Copy frontend source
COPY services/frontend/ ./

# Build React application
ARG VITE_API_GATEWAY_URL
ENV VITE_API_GATEWAY_URL=$VITE_API_GATEWAY_URL
RUN npm run build

# ==========================================
# Stage 2: Nginx Runtime
# ==========================================
FROM nginx:alpine

# Copy React build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy frontend Nginx configuration
COPY services/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]