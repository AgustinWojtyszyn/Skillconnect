#!/bin/bash

# Función para manejar errores
handle_error() {
    echo "Error: $1"
    exit 1
}

echo "Starting Django application..."

# Aplicar migraciones de Django con timeout
echo "Applying database migrations..."
python manage.py migrate || handle_error "Failed to apply migrations"

echo "Collecting static files..."
python manage.py collectstatic --noinput || handle_error "Failed to collect static files"

echo "Starting Gunicorn..."
# Usar el puerto 8000 para el backend mientras nginx maneja el 8080
# Configurar timeout más largo para permitir inicialización
gunicorn skillconnect.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info \
    || handle_error "Failed to start Gunicorn"