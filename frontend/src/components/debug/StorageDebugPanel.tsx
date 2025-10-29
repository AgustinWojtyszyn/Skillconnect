import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function StorageDebugPanel() {
  const { user } = useAuth();
  const [bucketStatus, setBucketStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  useEffect(() => {
    checkBucket();
  }, []);

  const checkBucket = async () => {
    try {
      console.log('🔍 Iniciando verificación de bucket...');
      
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      console.log('📋 Resultado listBuckets:', { buckets, error });
      
      if (error) {
        console.error('❌ Error al listar buckets:', error);
        
        // Si es un error de RLS, significa que probablemente el bucket existe
        // pero no tenemos permisos para listarlo o acceder a él
        const isRLSError = error.message.includes('row-level security') || 
                           error.message.includes('RLS') ||
                           error.message.includes('policy');
        
        console.log('🔒 ¿Es error RLS?', isRLSError);
        
        setBucketStatus({ 
          exists: isRLSError ? 'unknown' : false, 
          error: error.message,
          isRLSError,
          buckets: [] 
        });
        return;
      }

      console.log('✅ Buckets listados correctamente:', buckets);
      
      const avatarsBucket = buckets?.find((b: any) => b.name === 'avatars');
      
      console.log('🎯 Bucket avatars:', avatarsBucket);
      
      setBucketStatus({
        exists: !!avatarsBucket,
        isPublic: avatarsBucket?.public || false,
        allBuckets: buckets?.map((b: any) => b.name) || [],
        bucket: avatarsBucket,
        isRLSError: false
      });
    } catch (err: any) {
      console.error('💥 Error inesperado:', err);
      setBucketStatus({ 
        exists: false, 
        error: err.message,
        isRLSError: false,
        buckets: [] 
      });
    }
  };

  const testUpload = async () => {
    if (!user) {
      setTestResult('❌ No hay usuario autenticado');
      return;
    }

    setLoading(true);
    setTestResult('🔄 Probando subida...');

    try {
      // Crear un blob de prueba (imagen de 1x1 pixel)
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
      }
      
      const blob = await new Promise<Blob>((resolve) => 
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );

      const testPath = `${user.id}/test-${Date.now()}.png`;
      
      setTestResult(`🔄 Subiendo a: ${testPath}`);
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(testPath, blob, { upsert: true });

      if (error) {
        setTestResult(`❌ Error al subir: ${error.message}`);
        console.error('Upload error:', error);
        return;
      }

      setTestResult(`✅ Subida exitosa! Path: ${data.path}`);
      
      // Intentar obtener URL pública
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(testPath);
      
      setTestResult(`✅ URL pública: ${urlData.publicUrl}`);
      
      // Intentar actualizar el perfil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', user.id);
      
      if (updateError) {
        setTestResult(prev => prev + `\n⚠️ Error al actualizar perfil: ${updateError.message}`);
      } else {
        setTestResult(prev => prev + '\n✅ Perfil actualizado correctamente');
      }
      
    } catch (err: any) {
      setTestResult(`❌ Error inesperado: ${err.message}`);
      console.error('Test error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBucket = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });

      if (error) {
        setTestResult(`❌ Error al crear bucket: ${error.message}`);
      } else {
        setTestResult(`✅ Bucket creado! Ahora configura las políticas RLS en Supabase Dashboard.`);
        checkBucket();
      }
    } catch (err: any) {
      setTestResult(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-50"
        title="Mostrar panel de debug"
      >
        🔧
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-xl shadow-2xl border-2 border-blue-600 p-4 z-50 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg flex items-center gap-2">
          🔧 Debug Storage
        </h3>
        <button
          onClick={() => setShowPanel(false)}
          className="text-gray-400 hover:text-gray-600"
          title="Cerrar"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        {/* Status del bucket */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-2">Estado del bucket "avatars":</p>
          {bucketStatus ? (
            <>
              <p className={bucketStatus.exists ? 'text-green-600' : 'text-red-600'}>
                {bucketStatus.exists === 'unknown' ? '⚠️ No se puede verificar (RLS)' : 
                 bucketStatus.exists ? '✅ Existe' : '❌ No existe'}
              </p>
              {bucketStatus.exists && bucketStatus.exists !== 'unknown' && (
                <p className={bucketStatus.isPublic ? 'text-green-600' : 'text-orange-600'}>
                  {bucketStatus.isPublic ? '✅ Público' : '⚠️ No público'}
                </p>
              )}
              <p className="text-gray-600 mt-1 text-xs">
                Buckets disponibles: {bucketStatus.allBuckets?.join(', ') || 'ninguno'}
              </p>
              {bucketStatus.error && (
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-red-600 hover:text-red-700">
                    Ver error completo
                  </summary>
                  <pre className="mt-1 bg-red-50 p-2 rounded text-red-800 overflow-x-auto">
                    {bucketStatus.error}
                  </pre>
                </details>
              )}
            </>
          ) : (
            <p className="text-gray-400">Cargando...</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          {!bucketStatus?.exists && (
            <button
              onClick={createBucket}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-xs"
            >
              Crear Bucket
            </button>
          )}
          
          <button
            onClick={testUpload}
            disabled={loading || !bucketStatus?.exists}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs"
          >
            Probar Subida
          </button>
          
          <button
            onClick={checkBucket}
            disabled={loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 text-xs"
          >
            Recargar
          </button>
        </div>

        {/* Resultado del test */}
        {testResult && (
          <div className="bg-gray-800 text-green-400 p-3 rounded-lg font-mono text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
            {testResult}
          </div>
        )}

        {/* Instrucciones para error RLS */}
        {bucketStatus?.isRLSError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 text-xs space-y-2">
            <p className="font-bold text-red-900">🔒 Error de Políticas RLS en Storage Buckets</p>
            <p className="text-red-800">
              Hay un error de permisos RLS al intentar listar los buckets. Esto es diferente a las políticas de los objetos.
            </p>
            
            <div className="bg-red-100 p-2 rounded mt-2">
              <p className="font-semibold text-red-900">⚠️ Problema detectado:</p>
              <p className="text-red-800 mt-1">
                Las políticas RLS en la tabla <code className="bg-red-200 px-1">storage.buckets</code> están bloqueando 
                la lectura de buckets desde el cliente. Esto es un problema de configuración de Supabase.
              </p>
            </div>
            
            <p className="font-semibold text-red-900 mt-3">Solución - Ejecuta en SQL Editor:</p>
            <pre className="bg-red-900 text-red-100 p-2 rounded text-[10px] overflow-x-auto mt-1">
{`-- Permitir que usuarios autenticados vean los buckets
CREATE POLICY "Allow authenticated users to read buckets"
ON storage.buckets FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuarios públicos vean buckets públicos  
CREATE POLICY "Allow public to read public buckets"
ON storage.buckets FOR SELECT
TO public
USING (public = true);`}
            </pre>
            
            <button
              onClick={() => {
                const sql = `-- Permitir que usuarios autenticados vean los buckets
CREATE POLICY "Allow authenticated users to read buckets"
ON storage.buckets FOR SELECT
TO authenticated
USING (true);

-- Permitir que usuarios públicos vean buckets públicos  
CREATE POLICY "Allow public to read public buckets"
ON storage.buckets FOR SELECT
TO public
USING (public = true);`;
                navigator.clipboard.writeText(sql);
                setTestResult('✅ SQL copiado - Ejecútalo en SQL Editor');
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            >
              📋 Copiar SQL para Buckets
            </button>
            
            <p className="font-semibold text-red-900 mt-3">Después, ejecuta las políticas para objetos:</p>
            
            <p className="font-semibold text-red-900 mt-3">Ejecuta este SQL en Supabase Dashboard:</p>
            <pre className="bg-red-900 text-red-100 p-2 rounded text-[10px] overflow-x-auto mt-1">
{`-- 1. Lectura pública de avatars
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Subida autenticada (solo propios archivos)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Actualización autenticada (solo propios)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);`}
            </pre>
            
            <button
              onClick={() => {
                const sql = `-- 1. Lectura pública de avatars
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- 2. Subida autenticada (solo propios archivos)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Actualización autenticada (solo propios)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);`;
                navigator.clipboard.writeText(sql);
                setTestResult('✅ SQL copiado al portapapeles');
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            >
              📋 Copiar SQL
            </button>
            
            <ol className="list-decimal list-inside space-y-1 text-red-800 mt-3">
              <li>Copia el SQL con el botón de arriba</li>
              <li>Ve a <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">Supabase Dashboard</a></li>
              <li>Navega a <strong>SQL Editor</strong></li>
              <li>Pega el SQL y haz clic en <strong>"Run"</strong></li>
              <li>Vuelve aquí y haz clic en <strong>"Probar Subida"</strong></li>
            </ol>
          </div>
        )}
        
        {/* Instrucciones bucket no existe */}
        {!bucketStatus?.exists && !bucketStatus?.isRLSError && (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 text-xs space-y-2">
            <p className="font-bold text-yellow-900">❌ Bucket no existe - Crear manualmente:</p>
            <ol className="list-decimal list-inside space-y-1 text-yellow-800">
              <li>Ve a <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
              <li>Storage → New bucket</li>
              <li>Nombre: <code className="bg-yellow-200 px-1">avatars</code></li>
              <li>Marca: <strong>Public bucket ✓</strong></li>
              <li>Create bucket</li>
            </ol>
            <p className="text-yellow-700 font-semibold mt-2">Luego haz clic en "Recargar"</p>
          </div>
        )}
        
        {bucketStatus?.exists && !bucketStatus?.isPublic && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-3 text-xs space-y-2">
            <p className="font-semibold text-orange-800">⚠️ Bucket no es público</p>
            <ol className="list-decimal list-inside space-y-1 text-orange-700">
              <li>Ve a Supabase Dashboard</li>
              <li>Storage → avatars → Settings</li>
              <li>Activa "Public bucket"</li>
              <li>Haz clic en "Recargar"</li>
            </ol>
          </div>
        )}

        {bucketStatus?.exists && bucketStatus?.isPublic && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 text-xs space-y-2">
            <p className="font-semibold text-blue-800">✅ Bucket OK - Configura políticas RLS:</p>
            <p className="text-blue-700">Ve a Supabase Dashboard → SQL Editor y ejecuta:</p>
            <pre className="bg-blue-900 text-blue-100 p-2 rounded text-[10px] overflow-x-auto mt-1">
{`-- Lectura pública
CREATE POLICY "Public Read" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Subida autenticada
CREATE POLICY "Auth Upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.role() = 'authenticated' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Actualización propia
CREATE POLICY "Auth Update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);`}
            </pre>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`CREATE POLICY "Public Read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);`);
                setTestResult('📋 SQL copiado al portapapeles');
              }}
              className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
            >
              📋 Copiar SQL
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
