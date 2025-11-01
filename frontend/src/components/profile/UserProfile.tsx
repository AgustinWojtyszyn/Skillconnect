import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, MessageCircle, MapPin, Users, Briefcase } from 'lucide-react';

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
  user_id: string;
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
  onOpenUser?: (userId: string) => void;
}

export function UserProfile({ userId, onBack, onStartChat, onOpenUser }: UserProfileProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [friends, setFriends] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAvatar, setShowAvatar] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data: p, error: pe } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (pe) console.warn('profile error', pe.message);
        setProfile((p as Profile) || null);

        const { data: s, error: se } = await supabase
          .from('skills')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (se) console.warn('skills error', se.message);
        setSkills((s as Skill[]) || []);

        // Friendships: gather both sides
        const { data: fr, error: fe } = await supabase
          .from('friendships')
          .select('follower_id, following_id')
          .or(`follower_id.eq.${userId},following_id.eq.${userId}`);
        if (fe) {
          console.warn('friendships error', fe.message);
          setFriends([]);
        } else if (fr && fr.length) {
          const ids = Array.from(
            new Set(
              fr.map((row: { follower_id: string; following_id: string }) =>
                row.follower_id === userId ? row.following_id : row.follower_id
              )
            )
          );
          if (ids.length) {
            const { data: pf, error: pfe } = await supabase
              .from('profiles')
              .select('*')
              .in('id', ids);
            if (pfe) console.warn('friends profiles error', pfe.message);
            setFriends((pf as Profile[]) || []);
          } else {
            setFriends([]);
          }
        } else {
          setFriends([]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <button onClick={onBack} className="mb-4 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg">Volver</button>
        <p className="text-gray-600">No se encontró el perfil.</p>
      </div>
    );
  }

  // Preparar nombre principal y secundarios para evitar mostrar emails feos con sufijos
  const displayName = profile.full_name || profile.username || (profile.email ? profile.email.split('@')[0] : 'Usuario');
  const secondaryLine = profile.email || profile.username || '';

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Card de encabezado sin banner */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="px-4 sm:px-6 py-4 md:py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-white hover:bg-gray-100 rounded-lg border shadow-sm"
              title="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            {profile.avatar_url ? (
              <button onClick={() => setShowAvatar(true)} className="focus:outline-none">
                <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-gray-200 object-cover" />
              </button>
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border border-gray-200 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl md:text-2xl">
                {(profile.email || profile.username || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 truncate">{displayName}</h2>
              {secondaryLine && (
                <p className="text-sm md:text-base text-gray-500 truncate italic">{secondaryLine}</p>
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
                className="px-4 md:px-5 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-md transition flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm md:text-base">Enviar mensaje</span>
              </button>
            </div>
          </div>

          {profile.bio && (
            <p className="mt-4 text-gray-700 leading-relaxed">{profile.bio}</p>
          )}

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Briefcase className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{skills.length} habilidades</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{friends.length} amigos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Skills del usuario */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Habilidades</h3>
        {skills.length === 0 ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <p>Este usuario aún no publicó habilidades visibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((sk) => (
              <button key={sk.id} onClick={() => setSelectedSkill(sk)} className="text-left border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 truncate">{sk.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sk.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {sk.is_offering ? 'Ofrezco' : 'Busco'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3">{sk.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{sk.category}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{sk.level}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amigos */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Amigos</h3>
        {friends.length === 0 ? (
          <div className="flex items-center gap-3 text-gray-600">
            <Users className="w-5 h-5 text-gray-400" />
            <p>Este usuario aún no tiene amigos visibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                <button
                  onClick={() => onOpenUser && onOpenUser(f.id)}
                  className="flex items-center gap-3 min-w-0 text-left"
                >
                  {f.avatar_url ? (
                    <img src={f.avatar_url} alt={f.username} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {(f.email || f.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-sm md:text-base font-semibold text-gray-900 truncate tracking-tight">{f.email || f.username}</div>
                    {(f.full_name || f.username) && (
                      <div className="text-xs text-gray-500 truncate italic">{f.full_name || f.username}</div>
                    )}
                  </div>
                </button>
                <button
                  onClick={() => onStartChat(f.id, f.username)}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mensaje
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal avatar */}
      {showAvatar && profile.avatar_url && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowAvatar(false)}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={profile.avatar_url} alt="Avatar grande" className="w-full h-auto rounded-xl shadow-2xl" />
            <button
              onClick={() => setShowAvatar(false)}
              className="absolute -top-3 -right-3 bg-white text-gray-700 rounded-full px-3 py-1 shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Modal skill */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedSkill(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-xl font-bold text-gray-900">{selectedSkill.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedSkill.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                    {selectedSkill.is_offering ? 'Ofrezco' : 'Busco'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{selectedSkill.category}</span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded-lg">{selectedSkill.level}</span>
                </div>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedSkill.description}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  onStartChat(profile.id, profile.username);
                  setSelectedSkill(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Iniciar chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
