# Frontend Dockerfile
FROM node:20.11.1-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Create temp directories in a location with write permissions
RUN mkdir -p /tmp/nginx/client-body && \
    mkdir -p /tmp/nginx/proxy && \
    mkdir -p /tmp/nginx/fastcgi && \
    mkdir -p /tmp/nginx/uwsgi && \
    mkdir -p /tmp/nginx/scgi

# Copy build files and config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create custom nginx.conf with temp paths configuration
RUN echo 'pid /tmp/nginx.pid; \n\
events { \n\
    worker_connections 1024; \n\
} \n\
http { \n\
    client_body_temp_path /tmp/nginx/client-body; \n\
    proxy_temp_path /tmp/nginx/proxy; \n\
    fastcgi_temp_path /tmp/nginx/fastcgi; \n\
    uwsgi_temp_path /tmp/nginx/uwsgi; \n\
    scgi_temp_path /tmp/nginx/scgi; \n\
    include /etc/nginx/conf.d/*.conf; \n\
}' > /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]