import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { MapPin, Edit2, Plus, Trash2, Save, X, Camera } from 'lucide-react';
import '../../utils/checkStorage';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
}

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  is_offering: boolean;
  visibility: 'public' | 'friends';
}

const CATEGORY_KEYS = [
  'programming',
  'design',
  'marketing',
  'writing',
  'business',
  'music',
  'languages',
  'other',
];

export function Profile() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [imgVersion, setImgVersion] = useState(0); // para forzar recarga de imágenes tras upload
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);
  const [previewBannerUrl, setPreviewBannerUrl] = useState<string | null>(null);
  const [pendingAvatarRemoteUrl, setPendingAvatarRemoteUrl] = useState<string | null>(null);
  const [pendingBannerRemoteUrl, setPendingBannerRemoteUrl] = useState<string | null>(null);

  // Pre-cargar imagen remota hasta que esté disponible (por propagación del CDN)
  const ensureRemoteReady = async (url: string, maxAttempts = 10, delayMs = 500) => {
    for (let i = 0; i < maxAttempts; i++) {
      const testUrl = `${url}${url.includes('?') ? '&' : '?'}cb=${Date.now()}`;
      const ok = await new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = testUrl;
      });
      if (ok) return true;
      await new Promise((r) => setTimeout(r, delayMs));
    }
    return false;
  };

  // Polling periódicamente si hay URLs remotas pendientes mientras hay preview
  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (previewAvatarUrl && pendingAvatarRemoteUrl) {
        const ok = await ensureRemoteReady(pendingAvatarRemoteUrl);
        if (!cancelled && ok) {
          setPreviewAvatarUrl(null);
          setImgVersion((v) => v + 1);
        }
      }
      if (previewBannerUrl && pendingBannerRemoteUrl) {
        const ok = await ensureRemoteReady(pendingBannerRemoteUrl);
        if (!cancelled && ok) {
          setPreviewBannerUrl(null);
          setImgVersion((v) => v + 1);
        }
      }
    };
    // Lanzar primer chequeo y luego cada 2s si sigue pendiente
    tick();
    const id = setInterval(tick, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [previewAvatarUrl, previewBannerUrl, pendingAvatarRemoteUrl, pendingBannerRemoteUrl]);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
  });

  const [skillForm, setSkillForm] = useState({
    title: '',
    description: '',
    category: 'programming',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'expert',
    is_offering: true,
    visibility: 'public' as 'public' | 'friends',
  });

  // Generar iniciales y color para avatar
  const avatarData = useMemo(() => {
    const name = profile?.full_name || profile?.username || 'U';
    const parts = name.trim().split(' ');
    const initials =
      parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-cyan-500 to-blue-600',
      'from-pink-500 to-rose-600',
    ];
    const hash = (profile?.username || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const color = colors[hash % colors.length];
    return { initials, color };
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSkills();
    }
  }, [user]);

  const displayUsername = useMemo(() => {
    const metaUser = (user?.user_metadata?.username as string) || '';
    const emailUser = user?.email ? user.email.split('@')[0] : '';
    return profile?.username || metaUser || emailUser || '';
  }, [profile?.username, user]);

  const fetchProfile = async () => {
    console.log('🔍 Fetching profile for user:', user!.id);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, bio, location, avatar_url, banner_url')
      .eq('id', user!.id)
      .maybeSingle();

    console.log('📋 Profile data:', data);
    console.log('❌ Profile error:', error);

    if (!error && data) {
      setProfile(data);
      // Si las URLs guardadas coinciden con las pendientes, limpiar pendientes
      if (pendingAvatarRemoteUrl && data.avatar_url === pendingAvatarRemoteUrl) {
        setPendingAvatarRemoteUrl(null);
      }
      if (pendingBannerRemoteUrl && data.banner_url === pendingBannerRemoteUrl) {
        setPendingBannerRemoteUrl(null);
      }
      setProfileForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        location: data.location || '',
      });
    }
    setLoading(false);
  };

  const fetchSkills = async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSkills(data);
    }
  };

  const updateProfile = async () => {
    // Primero, actualizar campos de texto
    const { error } = await supabase
      .from('profiles')
      .update(profileForm)
      .eq('id', user!.id);

    if (!error) {
      // Luego, asegurar que URLs pendientes queden persistidas
      try {
        if (pendingAvatarRemoteUrl && profile?.avatar_url !== pendingAvatarRemoteUrl) {
          await supabase.from('profiles').update({ avatar_url: pendingAvatarRemoteUrl }).eq('id', user!.id);
        }
        if (pendingBannerRemoteUrl && profile?.banner_url !== pendingBannerRemoteUrl) {
          await supabase.from('profiles').update({ banner_url: pendingBannerRemoteUrl }).eq('id', user!.id);
        }
      } catch {}

      setProfile({ ...profile!, ...profileForm });
      setEditingProfile(false);
      // Releer perfil final
      await fetchProfile();
    }
  };

  const saveSkill = async () => {
    if (editingSkill) {
      const { error } = await supabase
        .from('skills')
        .update(skillForm)
        .eq('id', editingSkill.id);

      if (!error) {
        fetchSkills();
        resetSkillForm();
      }
    } else {
      const { error } = await supabase
        .from('skills')
        .insert({
          ...skillForm,
          user_id: user!.id,
        });

      if (!error) {
        fetchSkills();
        resetSkillForm();
      }
    }
  };

  const deleteSkill = async (id: string) => {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchSkills();
    }
  };

  const resetSkillForm = () => {
    setSkillForm({
      title: '',
      description: '',
      category: 'programming',
      level: 'intermediate',
      is_offering: true,
      visibility: 'public',
    });
    setEditingSkill(null);
    setShowSkillForm(false);
  };

  const startEditSkill = (skill: Skill) => {
    setSkillForm({
      title: skill.title,
      description: skill.description,
      category: skill.category,
      level: skill.level,
      is_offering: skill.is_offering,
      visibility: skill.visibility || 'public',
    });
    setEditingSkill(skill);
    setShowSkillForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Banner y Avatar Profesional */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Banner con gradiente y botón para cambiar */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative group">
          {(previewBannerUrl || profile?.banner_url) && (
              <img
                src={
                  previewBannerUrl || `${profile!.banner_url!}${profile!.banner_url!.includes('?') ? '&' : '?'}v=${imgVersion}`
                }
                alt="Banner"
                className="w-full h-full object-cover"
                onError={() => {
                  // Reintentar una vez tras pequeño delay por propagación CDN
                  setTimeout(() => setImgVersion((v) => v + 1), 300);
                }}
              />
          )}
          {editingProfile && (
            <>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Banner button clicked');
                  bannerInputRef.current?.click();
                }}
                disabled={uploadingBanner}
                className="absolute top-4 right-4 p-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl shadow-lg transition-all hover:scale-105 z-10"
                title={t('profile.changeBanner') || 'Cambiar banner'}
              >
                {uploadingBanner ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                title={t('profile.changeBanner') || 'Cambiar banner'}
                aria-label={t('profile.changeBanner') || 'Cambiar banner'}
                onChange={async (e) => {
                  console.log('Banner input change triggered');
                  const file = e.target.files?.[0];
                  if (!file || !user) {
                    console.log('No file or user:', { file: !!file, user: !!user });
                    return;
                  }
                  console.log('Uploading banner:', file.name);
                  // Vista previa inmediata
                  const localUrl = URL.createObjectURL(file);
                  setPreviewBannerUrl(localUrl);
                  setUploadError(null);
                  setUploadingBanner(true);
                  try {
                    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                    const path = `${user.id}/banner-${Date.now()}.${ext}`;
                    console.log('Upload path:', path);
                    
                    const storage = supabase.storage.from('avatars');
                    let { error: upErr } = await storage.upload(path, file, {
                      upsert: true,
                      cacheControl: '3600',
                      contentType: file.type,
                    });
                    if (upErr) {
                      const msg = (upErr as any)?.message?.toLowerCase?.() || '';
                      if (msg.includes('exists') || msg.includes('duplicate') || msg.includes('409')) {
                        const { error: upd } = await storage.update(path, file, {
                          cacheControl: '3600',
                          contentType: file.type,
                        });
                        if (upd) throw upd;
                      } else {
                        console.error('Upload error:', upErr);
                        throw upErr;
                      }
                    }
                    
                    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
                        // Usar URL base y manejar cache-busting en render con imgVersion
                        const publicUrl = data?.publicUrl || null;
                    console.log('Public URL:', publicUrl);
                    
                    if (!publicUrl) throw new Error('No public URL');
                    
                    const { error: updErr } = await supabase
                      .from('profiles')
                      .update({ banner_url: publicUrl })
                      .eq('id', user.id);
                    
                    if (updErr) {
                      console.error('Profile update error:', updErr);
                      throw updErr;
                    }
                    
                    console.log('Banner uploaded successfully!');
                    setProfile((prev) => (prev ? { ...prev, banner_url: publicUrl } : prev));
                    setPendingBannerRemoteUrl(publicUrl);
                    setImgVersion((v) => v + 1);
                    // Releer del servidor para confirmar persistencia
                    await fetchProfile();
                    // Esperar a que la imagen remota esté lista antes de ocultar la preview
                    const ready = await ensureRemoteReady(publicUrl);
                    if (ready) {
                      URL.revokeObjectURL(localUrl);
                      setPreviewBannerUrl(null);
                    } else {
                      // Forzar otro reintento de carga remota
                      setImgVersion((v) => v + 1);
                    }
                  } catch (err: any) {
                    console.error('Banner upload failed:', err?.message || err);
                    setUploadError(t('profile.uploadError') || 'No se pudo subir la imagen. Inténtalo más tarde.');
                  } finally {
                    setUploadingBanner(false);
                    if (bannerInputRef.current) bannerInputRef.current.value = '';
                  }
                }}
              />
            </>
          )}
        </div>

        {/* Contenido del perfil */}
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
            {/* Avatar con iniciales coloreadas */}
            <div className="relative">
              {(previewAvatarUrl || profile?.avatar_url) ? (
                <img
                  src={
                    previewAvatarUrl || `${profile!.avatar_url!}${profile!.avatar_url!.includes('?') ? '&' : '?'}v=${imgVersion}`
                  }
                  alt="Avatar"
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl object-cover"
                  onError={() => {
                    setTimeout(() => setImgVersion((v) => v + 1), 300);
                  }}
                />
              ) : (
                <div
                  className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br ${avatarData.color} flex items-center justify-center text-white font-bold text-2xl sm:text-4xl`}
                >
                  {avatarData.initials}
                </div>
              )}
              {editingProfile && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      console.log('Avatar button clicked');
                      avatarInputRef.current?.click();
                    }}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition disabled:opacity-50"
                    title={t('profile.changeAvatar') || 'Cambiar avatar'}
                  >
                    {uploadingAvatar ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    title={t('profile.changeAvatar') || 'Cambiar avatar'}
                    aria-label={t('profile.changeAvatar') || 'Cambiar avatar'}
                    onChange={async (e) => {
                      console.log('Avatar input change triggered');
                      const file = e.target.files?.[0];
                      if (!file || !user) {
                        console.log('No file or user:', { file: !!file, user: !!user });
                        return;
                      }
                      console.log('Uploading avatar:', file.name);
                      const localUrl = URL.createObjectURL(file);
                      setPreviewAvatarUrl(localUrl);
                      setUploadError(null);
                      setUploadingAvatar(true);
                      try {
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
                        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
                        console.log('Upload path:', path);
                        
                        const storage = supabase.storage.from('avatars');
                        let { error: upErr } = await storage.upload(path, file, {
                          upsert: true,
                          cacheControl: '3600',
                          contentType: file.type,
                        });
                        if (upErr) {
                          const msg = (upErr as any)?.message?.toLowerCase?.() || '';
                          if (msg.includes('exists') || msg.includes('duplicate') || msg.includes('409')) {
                            const { error: upd } = await storage.update(path, file, {
                              cacheControl: '3600',
                              contentType: file.type,
                            });
                            if (upd) throw upd;
                          } else {
                            console.error('Upload error:', upErr);
                            throw upErr;
                          }
                        }
                        
                        const { data } = supabase.storage.from('avatars').getPublicUrl(path);
                        // Usar URL base y manejar cache-busting en render con imgVersion
                        const publicUrl = data?.publicUrl || null;
                        console.log('Public URL:', publicUrl);
                        
                        if (!publicUrl) throw new Error('No public URL');
                        
                        const { error: updErr } = await supabase
                          .from('profiles')
                          .update({ avatar_url: publicUrl })
                          .eq('id', user.id);
                        
                        if (updErr) {
                          console.error('Profile update error:', updErr);
                          throw updErr;
                        }
                        
                        console.log('Avatar uploaded successfully!');
                        setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
                        setPendingAvatarRemoteUrl(publicUrl);
                        setImgVersion((v) => v + 1);
                        await fetchProfile();
                        const ready = await ensureRemoteReady(publicUrl);
                        if (ready) {
                          URL.revokeObjectURL(localUrl);
                          setPreviewAvatarUrl(null);
                        } else {
                          setImgVersion((v) => v + 1);
                        }
                      } catch (err: any) {
                        console.error('Avatar upload failed:', err?.message || err);
                        setUploadError(t('profile.uploadError') || 'No se pudo subir tu avatar. Inténtalo más tarde.');
                      } finally {
                        setUploadingAvatar(false);
                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                      }
                    }}
                  />
                </>
              )}
            </div>

            {/* Info básica */}
            <div className="flex-1 min-w-0 w-full sm:ml-4 mt-2 sm:mt-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                    {profile?.full_name || displayUsername}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 truncate">@{displayUsername}</p>
                </div>
                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-4 py-2 text-sm sm:text-base rounded-xl font-semibold transition flex items-center gap-2 whitespace-nowrap border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  {editingProfile ? (
                    <>
                      <X className="w-4 h-4" /> {t('profile.cancel')}
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4" /> {t('profile.editProfile')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Formulario/vista */}
          <div className="mt-6">
            {editingProfile ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.fullName')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t('profile.fullName.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.bio')}</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder={t('profile.bio.placeholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('profile.location')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder={t('profile.location.placeholder')}
                  />
                </div>
                <button
                  onClick={updateProfile}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Save className="w-4 h-4" />
                  {t('profile.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile?.bio && <p className="text-gray-700 leading-relaxed">{profile.bio}</p>}
                {profile?.location && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {uploadError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
          <p className="text-sm">{uploadError}</p>
        </div>
      )}

      {/* Skills Section - Reemplazar completamente la sección antigua */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('profile.mySkills')}
          </h3>
          <button
            onClick={() => setShowSkillForm(!showSkillForm)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
          >
            <Plus className="w-4 h-4" />
            {t('profile.addSkill')}
          </button>
        </div>

        {showSkillForm && (
          <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.skill.title')}</label>
                <input
                  type="text"
                  value={skillForm.title}
                  onChange={(e) => setSkillForm({ ...skillForm, title: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder={t('profile.skill.title.placeholder')}
                />
              </div>
              <div>
                <label htmlFor="skill-category-select" className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.skill.category')}</label>
                <select
                  id="skill-category-select"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  {CATEGORY_KEYS.map((cat) => (
                    <option key={cat} value={cat}>
                      {t(`profile.category.${cat}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.skill.description')}</label>
              <textarea
                value={skillForm.description}
                onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                placeholder={t('profile.skill.description.placeholder')}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="skill-level-select" className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.skill.level')}</label>
                <select
                  id="skill-level-select"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value as any })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="beginner">{t('profile.level.beginner')}</option>
                  <option value="intermediate">{t('profile.level.intermediate')}</option>
                  <option value="expert">{t('profile.level.expert')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="skill-type-select" className="block text-sm font-semibold text-gray-700 mb-2">{t('profile.skill.type')}</label>
                <select
                  id="skill-type-select"
                  value={skillForm.is_offering ? 'offering' : 'seeking'}
                  onChange={(e) => setSkillForm({ ...skillForm, is_offering: e.target.value === 'offering' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="offering">{t('profile.skill.offering')}</option>
                  <option value="seeking">{t('profile.skill.seeking')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="skill-visibility-select" className="block text-sm font-semibold text-gray-700 mb-2">{t('skills.visibility')}</label>
                <select
                  id="skill-visibility-select"
                  value={skillForm.visibility}
                  onChange={(e) => setSkillForm({ ...skillForm, visibility: e.target.value as 'public' | 'friends' })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="public">{t('skills.visibility.public')}</option>
                  <option value="friends">{t('skills.visibility.friends')}</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveSkill}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
              >
                {editingSkill ? t('profile.skill.update') : t('profile.skill.add')}
              </button>
              <button
                onClick={resetSkillForm}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
              >
                {t('profile.cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="border-2 border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{skill.title}</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                        skill.is_offering
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                      }`}
                    >
                      {skill.is_offering ? t('profile.skill.offering') : t('profile.skill.seeking')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{skill.description}</p>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium">{t(`profile.category.${skill.category}`)}</span>
                    <span className="text-gray-300">•</span>
                    <span>{t(`profile.level.${skill.level}`)}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => startEditSkill(skill)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title={t('profile.editProfile')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title={t('profile.cancel')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-center text-gray-500 py-8">{t('profile.noSkills')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
