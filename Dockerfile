# Build stage for frontend
FROM node:20-alpine as frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Final stage
FROM python:3.11-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8080

# Instalar nginx
RUN apt-get update && apt-get install -y \
    nginx \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Configurar nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Configurar el backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos del backend
COPY backend/ .

# Copiar los archivos compilados del frontend
COPY --from=frontend-build /frontend/dist /usr/share/nginx/html

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Puerto para Back4App
EXPOSE 8080

# Comando de inicio
CMD ["/start.sh"]