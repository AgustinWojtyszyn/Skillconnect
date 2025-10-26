# ============================
# Frontend Build Stage
# ============================
FROM node:20-alpine3.19 AS frontend-builder

# Actualizar paquetes de la imagen base para corregir vulnerabilidades
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Mostrar el contenido actual para debugging
RUN pwd && ls -la

# Copiar archivos del frontend
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./
COPY frontend/index.html ./
COPY frontend/src ./src
COPY frontend/public/ ./public/

# Instalar dependencias
RUN npm install || exit 1

# Construir la aplicación
RUN npm run build || exit 1

# ============================
# Backend and Final Stage
# ============================
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1
# Asegurar que la salida de Python se envíe directamente a la terminal
ENV PYTHONUNBUFFERED=1
# Puerto requerido por Back4App
ENV PORT=8080
# Modo producción para React
ENV NODE_ENV=production

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Crear usuario no root para seguridad
RUN useradd -m appuser

# Configurar directorios
WORKDIR /app
RUN chown -R appuser:appuser /app

# Copiar y configurar nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/sites-enabled/default || true

# Instalar dependencias de Python
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos backend
COPY backend/ .

# Copiar frontend compilado desde la etapa anterior
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
RUN chown -R appuser:appuser /usr/share/nginx/html

# Crear directorios necesarios con permisos correctos
RUN mkdir -p /app/static /app/media \
    && chown -R appuser:appuser /app/static /app/media

# Script de inicio
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Cambiar al usuario no root
USER appuser

# Verificar la configuración de nginx
RUN nginx -t || exit 1

# Puerto requerido por Back4App
EXPOSE 8080

# Comando de inicio con manejo de errores
CMD ["/start.sh"]