# Frontend Dockerfile
FROM node:20.11.1-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Create necessary directories in /tmp
RUN mkdir -p /tmp/nginx && \
    mkdir -p /tmp/nginx/temp && \
    mkdir -p /tmp/nginx/client-body && \
    mkdir -p /tmp/nginx/proxy && \
    mkdir -p /tmp/nginx/fastcgi && \
    mkdir -p /tmp/nginx/uwsgi && \
    mkdir -p /tmp/nginx/scgi && \
    mkdir -p /tmp/nginx/logs

# Generate minimal nginx.conf
RUN echo 'worker_processes auto; \n\
pid /tmp/nginx/nginx.pid; \n\
events { \n\
    worker_connections 1024; \n\
} \n\
http { \n\
    client_body_temp_path /tmp/nginx/client-body; \n\
    proxy_temp_path /tmp/nginx/proxy; \n\
    fastcgi_temp_path /tmp/nginx/fastcgi; \n\
    uwsgi_temp_path /tmp/nginx/uwsgi; \n\
    scgi_temp_path /tmp/nginx/scgi; \n\
    access_log /tmp/nginx/logs/access.log; \n\
    error_log /tmp/nginx/logs/error.log; \n\
    include /etc/nginx/mime.types; \n\
    default_type application/octet-stream; \n\
    sendfile on; \n\
    tcp_nopush on; \n\
    keepalive_timeout 65; \n\
    gzip on; \n\
    server { \n\
        listen 8080; \n\
        root /usr/share/nginx/html; \n\
        location / { \n\
            try_files $uri $uri/ /index.html; \n\
        } \n\
        location /api/ { \n\
            proxy_pass http://127.0.0.1:8000; \n\
            proxy_set_header Host $host; \n\
            proxy_set_header X-Real-IP $remote_addr; \n\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n\
            proxy_set_header X-Forwarded-Proto $scheme; \n\
        } \n\
    } \n\
}' > /etc/nginx/nginx.conf

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Set permissions for all nginx directories
RUN chown -R nginx:nginx /tmp/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /tmp/nginx

USER nginx

EXPOSE 8080

# Test nginx configuration and start
CMD ["sh", "-c", "nginx -t && nginx -g 'daemon off;'"]