# ============================
# Frontend Build Stage
# ============================
FROM node:22-slim AS frontend-builder

# Actualizar paquetes y evitar caché
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo los archivos necesarios para instalar dependencias (rutas relativas al contexto actual)
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Instalar dependencias (incluye dev deps necesarias para el build)
RUN npm install

# Copiar el resto del frontend
COPY . ./

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
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 10000 (puerto que usa Render)
EXPOSE 10000

# Usar el CMD por defecto de nginx (nginx -g 'daemon off;')
CMD ["nginx", "-g", "daemon off;"]
