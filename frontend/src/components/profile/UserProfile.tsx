import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MessageCircle, MapPin } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  email: string | null;
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

interface UserProfileProps {
  userId: string;
  onBack: () => void;
  onStartChat: (userId: string, username: string) => void;
}

export function UserProfile({ userId, onBack, onStartChat }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: p } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, location, avatar_url, banner_url, email')
        .eq('id', userId)
        .maybeSingle();
      setProfile(p as Profile | null);

      const { data: s } = await supabase
        .from('skills')
        .select('id, title, description, category, level, is_offering, visibility')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      setSkills((s as Skill[]) || []);
      setLoading(false);
    };
    run();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <button onClick={onBack} className="mb-4 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">Volver</button>
        <p className="text-gray-600">No se encontró el perfil.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Encabezado */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
          {profile.banner_url && (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="Banner" />
          )}
        </div>
        <div className="px-4 sm:px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 sm:-mt-16">
            <button
              onClick={onBack}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg border shadow-sm"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl object-cover" />
            ) : (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-white shadow-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-2xl sm:text-4xl">
                {(profile.email || profile.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{profile.email || profile.username}</h2>
              {(profile.full_name || profile.username) && (
                <p className="text-sm sm:text-base text-gray-500 truncate italic">{profile.full_name || profile.username}</p>
              )}
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
            </div>
            <div className="ml-auto">
              <button
                onClick={() => onStartChat(profile.id, profile.username)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar mensaje
              </button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-gray-700 leading-relaxed">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Skills del usuario */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Habilidades</h3>
        {skills.length === 0 ? (
          <p className="text-gray-600">Este usuario aún no publicó habilidades visibles.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((sk) => (
              <div key={sk.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{sk.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sk.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {sk.is_offering ? 'Ofrezco' : 'Busco'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{sk.description}</p>
                <div className="text-xs text-gray-500 mt-2 italic">{sk.category} • {sk.level}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
