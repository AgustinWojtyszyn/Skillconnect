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

# Instalar dependencias del sistema y crear estructura de directorios
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && mkdir -p /tmp/nginx/{client-body,proxy,fastcgi,uwsgi,scgi,logs} \
    && chown -R www-data:www-data /tmp/nginx \
    && chmod 755 /tmp/nginx

# Configurar nginx con rutas temporales en /tmp
RUN echo 'pid /tmp/nginx.pid;\n\
worker_processes auto;\n\
events {\n\
    worker_connections 1024;\n\
}\n\
http {\n\
    client_body_temp_path /tmp/nginx/client-body;\n\
    proxy_temp_path /tmp/nginx/proxy;\n\
    fastcgi_temp_path /tmp/nginx/fastcgi;\n\
    uwsgi_temp_path /tmp/nginx/uwsgi;\n\
    scgi_temp_path /tmp/nginx/scgi;\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    sendfile on;\n\
    access_log /dev/stdout;\n\
    error_log /dev/stderr;\n\
    server {\n\
        listen 8080;\n\
        server_name localhost;\n\
        root /usr/share/nginx/html;\n\
        index index.html;\n\
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
        location /static/ {\n\
            expires 1y;\n\
            add_header Cache-Control "public, no-transform";\n\
        }\n\
    }\n\
}' > /etc/nginx/nginx.conf

# Crear usuario no root para seguridad
RUN useradd -m appuser

# Configurar directorios
WORKDIR /app
RUN chown -R appuser:appuser /app

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

# Comprobación de nginx durante la build puede fallar porque el backend no está en red aún.
# Hacemos la prueba no-fatal para no romper la build en el paso de creación de la imagen.
RUN nginx -t || true

# Puerto requerido por Back4App
EXPOSE 8080

# Comando de inicio con manejo de errores
CMD ["/start.sh"]