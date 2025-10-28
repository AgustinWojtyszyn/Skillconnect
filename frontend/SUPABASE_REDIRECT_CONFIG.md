# Configuración de Redirección de Email en Supabase

Para que el link de confirmación de email redirija a tu app desplegada en Render, sigue estos pasos:

## Paso 1: Accede a la configuración de Auth en Supabase

1. Entra a tu proyecto de Supabase: https://supabase.com/dashboard
2. Ve a **Authentication** → **URL Configuration** (en el menú lateral).

## Paso 2: Configura la Site URL

En el campo **Site URL**, ingresa:
```
https://skillconnect-bzxf.onrender.com
```

Esta es la URL principal de tu aplicación desplegada.

## Paso 3: Configura Redirect URLs

En la sección **Redirect URLs**, agrega las siguientes URLs (una por línea):
```
https://skillconnect-bzxf.onrender.com
https://skillconnect-bzxf.onrender.com/**
http://localhost:5173
http://localhost:5173/**
```

- Las primeras dos permiten redirecciones desde tu app en producción.
- Las últimas dos permiten redirecciones durante el desarrollo local.

## Paso 4: Guarda los cambios

Haz clic en **Save** para aplicar la configuración.

## Qué hace esta configuración

- **Site URL**: URL base de tu aplicación. Supabase la usa como fallback si no hay una redirect URL específica.
- **Redirect URLs**: Lista de URLs permitidas para redirigir tras confirmación de email, login con OAuth, etc. El wildcard `/**` permite cualquier ruta dentro del dominio.

## Resultado

Una vez configurado:
- Los usuarios que confirmen su email por el link recibido serán redirigidos a `https://skillconnect-bzxf.onrender.com/`.
- La aplicación los detectará como autenticados y mostrará el dashboard.

## Notas adicionales

- Si cambias el dominio de Render, actualiza estas URLs en Supabase.
- Para desarrollo local, asegúrate de que las URLs de `localhost` permanezcan en la lista.
