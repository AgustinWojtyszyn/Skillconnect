#!/bin/bash

# Iniciar nginx en segundo plano
nginx

# Aplicar migraciones de Django
python manage.py migrate

# Recopilar archivos estáticos
python manage.py collectstatic --noinput

# Iniciar Gunicorn
# Usamos puerto 8000 para el backend mientras nginx escucha en 8080
gunicorn skillconnect.wsgi:application --bind 0.0.0.0:8000 --workers 3