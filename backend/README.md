# SkillConnect Backend

Micro backend Django REST Framework para gestión de usuarios, habilidades y mensajes.

## Instalación
1. Clonar repositorio
2. Instalar dependencias (`pip install -r requirements.txt`)
3. Migrar base de datos (`python manage.py migrate`)
4. Crear usuario admin (`python manage.py createsuperuser`)

## Ejecución local
```bash
python manage.py runserver
```

## Despliegue en Render
- Añadir Procfile
- Configurar variables de entorno (SECRET_KEY, DEBUG, ALLOWED_HOSTS)
- Deploy automático desde GitHub

## Endpoints
- /api/skills/ CRUD de habilidades
- /api/messages/ CRUD de mensajes
- /api/token/ autenticación JWT