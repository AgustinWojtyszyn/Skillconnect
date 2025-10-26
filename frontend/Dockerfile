# Frontend Dockerfile
FROM node:20.11.1-slim as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

# Production stage
FROM nginx:alpine

# Create required directories and set permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/lib/nginx /var/lib/nginx/body && \
    chown -R nginx:nginx /var/cache/nginx /var/log/nginx /var/lib/nginx && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /var/lib/nginx

# Copy build files and config
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ensure nginx user owns the content
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

# Switch to non-root nginx user
USER nginx

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]