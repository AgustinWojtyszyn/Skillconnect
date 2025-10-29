# 🔧 Guía de Troubleshooting - Botones de Avatar y Banner

## ✅ He implementado las siguientes mejoras:

### 1. **Botones ahora siempre visibles en modo edición**
- ❌ Antes: El botón del banner solo aparecía con hover (no funcionaba en móvil)
- ✅ Ahora: Ambos botones son siempre visibles cuando haces clic en "Editar perfil"

### 2. **Indicadores visuales de carga**
- Ambos botones muestran un spinner mientras se sube la imagen
- Los botones se deshabilitan durante la subida para evitar clics múltiples

### 3. **Console.log exhaustivo**
- Cada paso del proceso ahora imprime información en la consola del navegador
- Esto te ayudará a identificar exactamente dónde falla

### 4. **Script de verificación de Storage**
- Al cargar el perfil, verifica automáticamente que el bucket "avatars" existe
- Muestra en consola si está configurado correctamente

---

## 🧪 Cómo probar ahora:

1. **Abre la aplicación en el navegador**
   - Ve a tu perfil
   - Abre las Herramientas de Desarrollador (F12)
   - Ve a la pestaña "Console"

2. **Verifica el bucket de Storage**
   - Al cargar el perfil, deberías ver en consola:
     ```
     🔍 Verificando configuración de Supabase Storage...
     ✅ Buckets disponibles: ['avatars']
     ✅ Bucket "avatars" encontrado
     ✅ Permisos de lectura OK
     ✨ Configuración de Storage verificada correctamente
     ```

3. **Prueba subir avatar/banner**
   - Haz clic en "Editar perfil"
   - Deberías ver los botones con íconos de cámara:
     - **Avatar**: Botón azul en la esquina inferior derecha del avatar
     - **Banner**: Botón blanco en la esquina superior derecha del banner
   - Haz clic en cualquiera
   - Selecciona una imagen
   - Observa la consola para ver el proceso:
     ```
     Avatar button clicked
     Avatar input change triggered
     Uploading avatar: imagen.jpg
     Upload path: abc123/avatar.jpg
     Public URL: https://...
     Avatar uploaded successfully!
     ```

---

## ❌ Si los botones NO aparecen:

### Verifica que estás en modo edición:
1. Haz clic en el botón "Editar perfil" (botón con lápiz)
2. El banner y avatar deben mostrar los botones de cámara

### Si aparece un error en consola:

#### Error: "Bucket 'avatars' not found"
**Solución:** Necesitas crear el bucket en Supabase:
```
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Storage > New bucket
4. Nombre: "avatars"
5. Marca "Public bucket" ✅
6. Crea el bucket
```

#### Error: "Row Level Security policy violation"
**Solución:** Configura las políticas RLS:
```sql
-- En Supabase > SQL Editor, ejecuta:

-- 1. Lectura pública
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- 2. Subida autenticada
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Actualización propia
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

#### Error: "column banner_url does not exist"
**Solución:** Añade la columna a la tabla profiles:
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS banner_url TEXT;
```

---

## 📱 Si los botones aparecen pero NO se abre el selector de archivos:

Esto indicaría un problema con las referencias (`avatarInputRef`, `bannerInputRef`). 
En la consola deberías ver: `"Avatar button clicked"` o `"Banner button clicked"`.

Si ves eso pero NO se abre el selector:
1. Intenta en otro navegador
2. Verifica que no haya bloqueadores de popups
3. Revisa permisos del navegador

---

## 🎯 Qué esperar después de subir:

1. Durante la subida:
   - El botón muestra un spinner
   - El botón está deshabilitado
   
2. Si todo va bien:
   - Consola: `"Avatar uploaded successfully!"` o `"Banner uploaded successfully!"`
   - La imagen aparece inmediatamente en tu perfil
   
3. Si falla:
   - Consola: Error detallado del problema
   - Aparece mensaje rojo arriba del perfil con el error traducido

---

## 📞 Si nada funciona:

Comparte en la consola del navegador (F12 > Console):
1. Los mensajes que aparecen al cargar el perfil
2. Los mensajes que aparecen al hacer clic en los botones
3. Cualquier error en rojo

¡Con esa información podré ayudarte mejor! 🚀
