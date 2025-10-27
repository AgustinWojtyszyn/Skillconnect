# ============================
# Frontend Build Stage
# ============================
FROM node:22-alpine3.20 AS frontend-builder

# Actualizar paquetes y evitar caché
RUN apk update && apk upgrade --no-cache

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar el resto del frontend
COPY frontend/ .

# Construir la aplicación
RUN npm run build

# ============================
# Serve Stage (Nginx)
# ============================
FROM nginx:alpine

# Crear usuario no root para seguridad
RUN adduser -D -H -u 1001 -s /sbin/nologin webuser

# Crear directorio y copiar archivos estáticos
RUN mkdir -p /app/www
COPY --from=frontend-builder /app/dist /app/www

# Copiar configuración de nginx
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Cambiar permisos y usuario
RUN chown -R webuser:webuser /app/www
USER webuser

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
# ============================
# Backend Stage