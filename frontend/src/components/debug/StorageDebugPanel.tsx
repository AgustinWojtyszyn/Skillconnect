import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export function StorageDebugPanel() {
  const { user } = useAuth();
  const [bucketStatus, setBucketStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkBucket();
  }, []);

  const checkBucket = async () => {
    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setBucketStatus({ 
          exists: false, 
          error: error.message,
          buckets: [] 
        });
        return;
      }

      const avatarsBucket = buckets?.find((b: any) => b.name === 'avatars');
      
      setBucketStatus({
        exists: !!avatarsBucket,
        isPublic: avatarsBucket?.public || false,
        allBuckets: buckets?.map((b: any) => b.name) || [],
        bucket: avatarsBucket
      });
    } catch (err: any) {
      setBucketStatus({ 
        exists: false, 
        error: err.message,
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

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white rounded-xl shadow-2xl border-2 border-blue-600 p-4 z-50">
      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
        🔧 Debug Storage
      </h3>
      
      <div className="space-y-3 text-sm">
        {/* Status del bucket */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-2">Estado del bucket "avatars":</p>
          {bucketStatus ? (
            <>
              <p className={bucketStatus.exists ? 'text-green-600' : 'text-red-600'}>
                {bucketStatus.exists ? '✅ Existe' : '❌ No existe'}
              </p>
              {bucketStatus.exists && (
                <p className={bucketStatus.isPublic ? 'text-green-600' : 'text-orange-600'}>
                  {bucketStatus.isPublic ? '✅ Público' : '⚠️ No público'}
                </p>
              )}
              <p className="text-gray-600 mt-1">
                Buckets disponibles: {bucketStatus.allBuckets?.join(', ') || 'ninguno'}
              </p>
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

        {/* Instrucciones */}
        {bucketStatus?.exists && !bucketStatus?.isPublic && (
          <div className="bg-orange-50 border-l-4 border-orange-400 p-2 text-xs">
            <p className="font-semibold text-orange-800">⚠️ Bucket no público</p>
            <p className="text-orange-700">Ve a Supabase Dashboard {'>'} Storage {'>'} avatars {'>'} Settings y activa "Public bucket"</p>
          </div>
        )}

        {bucketStatus?.exists && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-2 text-xs">
            <p className="font-semibold text-blue-800">ℹ️ Configura RLS</p>
            <p className="text-blue-700">Ejecuta las políticas SQL del archivo SUPABASE_STORAGE_SETUP.md</p>
          </div>
        )}
      </div>
    </div>
  );
}
