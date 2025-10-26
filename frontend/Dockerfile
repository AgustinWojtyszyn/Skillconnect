# Frontend Dockerfile
FROM node:20.11.1-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

USER root
RUN chown -R nginx:nginx /usr/share/nginx/html

# Generate nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf %s 'worker_processes auto;
events {
    worker_connections 1024;
}
http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    server {
        listen 8080;
        root /usr/share/nginx/html;
        location / {
            try_files $uri $uri/ /index.html;
        }
        location /api/ {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}' > /etc/nginx/nginx.conf

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]