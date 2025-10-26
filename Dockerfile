# ============================
# Frontend Build Stage
# ============================
FROM node:20-alpine AS frontend-builder

# Establecer directorio de trabajo para frontend
WORKDIR /frontend

# Primero copiar todo el contenido del proyecto
COPY . /app/

# Moverse al directorio frontend y copiar los archivos necesarios
WORKDIR /app/frontend

# Instalar dependencias con manejo de errores
RUN ls -la && \
    npm install --legacy-peer-deps || exit 1

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
COPY /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/sites-enabled/default || true

# Instalar dependencias de Python
COPY /app/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar archivos backend
COPY /app/backend/ .

# Copiar frontend compilado desde la etapa anterior
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html
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