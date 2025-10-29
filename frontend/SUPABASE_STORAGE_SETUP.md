# Configuración de Supabase Storage para Avatar y Banner

Para que funcione la subida de avatares y banners, necesitas configurar el bucket de Storage en Supabase.

## Pasos:

1. **Ir a Supabase Dashboard**
   - Abre tu proyecto en https://app.supabase.com

2. **Navegar a Storage**
   - En el menú lateral, haz clic en "Storage"

3. **Crear el bucket "avatars"** (si no existe)
   - Haz clic en "New bucket"
   - Nombre: `avatars`
   - Public bucket: **SÍ** (marca el checkbox para hacer el bucket público)
   - Haz clic en "Create bucket"

4. **Configurar políticas de acceso** (RLS)
   
   Ve a la pestaña "Policies" del bucket `avatars` y añade estas políticas:

   **Política 1: Permitir lectura pública**
   ```sql
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING ( bucket_id = 'avatars' );
   ```

   **Política 2: Permitir subida autenticada**
   ```sql
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

   **Política 3: Permitir actualización del propio archivo**
   ```sql
   CREATE POLICY "Users can update own files"
   ON storage.objects FOR UPDATE
   USING (
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   )
   WITH CHECK (
     bucket_id = 'avatars' 
     AND auth.role() = 'authenticated'
     AND (storage.foldername(name))[1] = auth.uid()::text
   );
   ```

5. **Añadir columna banner_url a la tabla profiles** (si no existe)
   
   Ve a "SQL Editor" y ejecuta:
   ```sql
   ALTER TABLE profiles 
   ADD COLUMN IF NOT EXISTS banner_url TEXT;
   ```

## Verificación

Una vez configurado, los usuarios podrán:
- Subir y cambiar su avatar haciendo clic en el ícono de cámara sobre su foto de perfil (modo edición)
- Subir y cambiar su banner haciendo hover sobre el banner y haciendo clic en el ícono de cámara (modo edición)

Las imágenes se guardarán en rutas como:
- Avatar: `avatars/{user_id}/avatar.{ext}`
- Banner: `avatars/{user_id}/banner.{ext}`
