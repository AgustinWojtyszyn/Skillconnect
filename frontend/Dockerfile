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
RUN echo 'worker_processes auto;\n\
events {\n\
    worker_connections 1024;\n\
}\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    sendfile on;\n\
    keepalive_timeout 65;\n\
    server {\n\
        listen 8080;\n\
        root /usr/share/nginx/html;\n\
        location / {\n\
            try_files $uri $uri/ /index.html;\n\
        }\n\
        location /api/ {\n\
            proxy_pass http://127.0.0.1:8000;\n\
            proxy_set_header Host $host;\n\
            proxy_set_header X-Real-IP $remote_addr;\n\
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n\
            proxy_set_header X-Forwarded-Proto $scheme;\n\
        }\n\
    }\n\
}' > /etc/nginx/nginx.conf

USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]