# Backend Dockerfile
FROM python:3.11-slim

# Establecer variables de entorno
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements e instalar dependencias
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código del proyecto
COPY backend/ .

# Exponer puerto
EXPOSE 8000

# Comando para ejecutar gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "skillconnect.wsgi:application"]