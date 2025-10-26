# SkillConnect

Plataforma para conectar personas basada en sus habilidades y permitir la comunicación entre ellas.

## Estructura del Proyecto

```
skillconnect/
├── frontend/     # Aplicación React + Vite + TypeScript
└── backend/      # API REST Django + DRF
```

## Frontend

### Tecnologías
- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase

### Instalación
```bash
cd frontend
npm install
npm run dev
```

## Backend

### Tecnologías
- Django
- Django REST Framework
- Simple JWT

### Instalación
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## API Endpoints

- `/api/skills/` - CRUD de habilidades
- `/api/messages/` - CRUD de mensajes
- `/api/token/` - Autenticación JWT

## Desarrollo

1. Clona el repositorio
2. Configura el frontend y backend siguiendo las instrucciones de instalación
3. Crea un archivo `.env` en la raíz del frontend con las variables necesarias
4. Ejecuta ambos servicios en terminales separadas