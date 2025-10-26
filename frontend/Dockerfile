# Frontend Dockerfile
FROM node:20.11.1-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Production stage
FROM nginxinc/nginx-unprivileged:alpine

# Copy build files and config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set proper permissions for nginx user
USER root
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d
USER nginx

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]