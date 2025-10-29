// Script temporal para verificar Supabase Storage
import { supabase } from '../lib/supabase';

export async function checkStorageSetup() {
  console.log('🔍 Verificando configuración de Supabase Storage...');
  
  try {
    // 1. Verificar que podemos listar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error al listar buckets:', bucketsError);
      return { success: false, error: 'No se puede acceder a Storage' };
    }
    
    console.log('✅ Buckets disponibles:', buckets?.map((b: any) => b.name));
    
    // 2. Verificar que existe el bucket 'avatars'
    const avatarsBucket = buckets?.find((b: any) => b.name === 'avatars');
    
    if (!avatarsBucket) {
      console.error('❌ El bucket "avatars" NO existe');
      console.log('📝 Crea el bucket siguiendo las instrucciones en SUPABASE_STORAGE_SETUP.md');
      return { success: false, error: 'Bucket "avatars" no encontrado' };
    }
    
    console.log('✅ Bucket "avatars" encontrado:', avatarsBucket);
    console.log('   - Público:', avatarsBucket.public);
    
    if (!avatarsBucket.public) {
      console.warn('⚠️ El bucket "avatars" NO es público. Las imágenes no serán visibles.');
    }
    
    // 3. Verificar permisos intentando listar archivos
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    
    if (listError) {
      console.warn('⚠️ Advertencia al listar archivos:', listError.message);
    } else {
      console.log('✅ Permisos de lectura OK');
    }
    
    console.log('✨ Configuración de Storage verificada correctamente');
    return { success: true };
    
  } catch (err: any) {
    console.error('❌ Error inesperado:', err);
    return { success: false, error: err.message };
  }
}

// Ejecutar automáticamente en desarrollo
if ((import.meta as any).env?.DEV) {
  checkStorageSetup();
}
