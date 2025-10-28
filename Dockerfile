# ============================
# Frontend Build Stage
# ============================
FROM node:22-slim AS frontend-builder

# Actualizar paquetes y evitar caché
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias
COPY frontend/package*.json ./
COPY frontend/tsconfig*.json ./
COPY frontend/vite.config.ts ./

# Instalar dependencias (incluye dev deps necesarias para el build)
RUN npm install

# Copiar el resto del frontend
COPY frontend/ .

# Construir la aplicación
RUN npm run build

# ============================
# Serve Stage (Nginx)
# ============================
FROM nginx:alpine

# Crear directorio y copiar archivos estáticos
RUN mkdir -p /app/www
COPY --from=frontend-builder /app/dist /app/www

# Copiar configuración estática de nginx (sin variables)
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
# ============================
# Backend Stage