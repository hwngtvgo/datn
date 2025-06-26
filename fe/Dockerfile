# Multi-stage build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Copy domain environment file để hỗ trợ proxy API qua nginx
COPY .env.domain .env.production

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Create simple nginx config
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    \
    # Tăng giới hạn kích thước body request lên 20MB \
    client_max_body_size 20M; \
    client_body_buffer_size 10M; \
    \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    \
    location /api/ { \
        proxy_pass http://YOUR_VPS_IP:8080; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        # Tăng giới hạn kích thước body request lên 20MB \
        client_max_body_size 20M; \
        client_body_buffer_size 10M; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 