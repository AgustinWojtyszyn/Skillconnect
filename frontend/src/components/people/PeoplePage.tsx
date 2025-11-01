import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { UserPlus, UserMinus, Search, Users, MessageCircle, Check, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  is_following?: boolean;
}

interface FriendRequest {
  id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface SuggestedUser extends User {
  skillBlurb?: string;
}

interface PeoplePageProps {
  onViewProfile?: (userId: string) => void;
  onStartChat?: (userId: string, username: string) => void;
}

export function PeoplePage({ onViewProfile, onStartChat }: PeoplePageProps) {
  const { user } = useAuth();
  const { t } = useI18n();
  // Wrapper de traducción con fallback para evitar mostrar claves crudas si faltan en despliegues
  const tt = (key: string, fallback: string) => {
    const v = t(key);
    return v === key ? fallback : v;
  };
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedTerm, setAppliedTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'following'>('all');
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);
  const [activeTab, setActiveTab] = useState<'people' | 'requests'>('people');
  const [requestProfiles, setRequestProfiles] = useState<Record<string, User>>({});

  useEffect(() => {
    if (user) {
      fetchUsers(appliedTerm);
    }
  }, [user, filter, appliedTerm]);

  // Búsqueda "normal": aplica automáticamente con leve debounce al tipear
  useEffect(() => {
    const handle = setTimeout(() => {
      // Evita consultas por 1 solo carácter para no ensuciar resultados
      if (searchTerm.trim().length >= 2 || searchTerm.trim().length === 0) {
        setAppliedTerm(searchTerm);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const fetchUsers = async (q?: string) => {
    setLoading(true);
    try {
      // 1) Descargar un lote de perfiles recientes (cliente hace el filtrado robusto)
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url, email, created_at')
        .order('created_at', { ascending: false })
        .limit(500);

      if (profilesError) {
        console.error('❌ Error fetching profiles:', profilesError);
        throw profilesError;
      }

      const profiles = (allProfiles || []) as User[];
      console.log('✅ Profiles loaded (client-filterable):', profiles.length);

      // Intentar obtener amistades del usuario actual (puede fallar si la tabla no existe)
      let followingIds = new Set<string>();
      let friendships: any[] | null = null;
      let friendshipsError: any = null;
      // Intento 1: esquema (follower_id, following_id)
      let frResp = await supabase
        .from('friendships')
        .select('following_id')
        .eq('follower_id', user!.id);
      friendships = frResp.data as any[] | null;
      friendshipsError = frResp.error;
      // Intento 2: esquema alternativo (follower_id, followee_id)
      if (friendshipsError || !friendships) {
        const alt = await supabase
          .from('friendships')
          .select('followee_id')
          .eq('follower_id', user!.id);
        if (!alt.error && alt.data) {
          friendships = alt.data as any[];
          friendshipsError = null;
          // Remapeamos a following_id para usar lógica única
          friendships = friendships.map((f: any) => ({ following_id: f.followee_id }));
        }
      }

      if (friendshipsError) {
        console.warn('⚠️ Friendships table not found or error:', friendshipsError.message);
        console.log('ℹ️ Continuing without friendship data (all users will show as not following)');
      } else {
        followingIds = new Set(
          (friendships || []).map((f: { following_id: string }) => f.following_id)
        );
        console.log('✅ Following IDs:', Array.from(followingIds));
      }

      let usersWithFollowing = profiles.map((p: User) => ({
        ...p,
        is_following: followingIds.has(p.id)
      })) || [];

      // 2) Filtrado en cliente (robusto: ignora @, tildes, mayúsculas; colapsa espacios)
      const rawQuery1 = (q ?? '').trim();
      const sanitizedQuery1 = rawQuery1.replace(/^@+/, '');
      if (sanitizedQuery1.length > 0) {
        const norm = (s: string) => s
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, ' ')
          .trim();
        const needle = norm(sanitizedQuery1);
        usersWithFollowing = usersWithFollowing.filter((p: any) =>
          norm(p.username || '').includes(needle) || norm(p.full_name || '').includes(needle) || norm(p.email || '').includes(needle)
        );
        console.log('🔎 Client-side matches:', usersWithFollowing.length);
      } else {
        // Sin término de búsqueda: ocultar el propio usuario por defecto
        usersWithFollowing = usersWithFollowing.filter((p: any) => p.id !== user!.id);
      }

      // Si hay término y coincide exactamente con mi usuario/nombre, permitimos que yo mismo aparezca
      if (sanitizedQuery1.length > 0) {
        const norm = (s: string) => s
          .toLowerCase()
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .replace(/\s+/g, ' ')
          .trim();
        const needle = norm(sanitizedQuery1);
        // Si el propio perfil no está en la lista, lo agregamos si coincide
        const me = profiles.find((p) => p.id === user!.id);
        if (me) {
          const matchMe = norm(me.username || '').includes(needle) || norm(me.full_name || '').includes(needle) || norm(me.email || '').includes(needle);
          if (matchMe && !usersWithFollowing.some((u: any) => u.id === me.id)) {
            usersWithFollowing.unshift({ ...me, is_following: false });
          }
        }
      }

      // Cargar TODAS las solicitudes del usuario (no dependientes del filtro de la lista)
      let outgoing: FriendRequest[] = [];
      let incoming: FriendRequest[] = [];
      {
        // Tolerante: si la tabla no existe (migración no aplicada), no rompe la vista
        let outData: FriendRequest[] | null = null;
        let inData: FriendRequest[] | null = null;
        const outResp = await supabase
          .from('friend_requests')
          .select('id, sender_id, recipient_id, status, created_at')
          .eq('sender_id', user!.id);
        if (outResp.error) {
          console.warn('⚠️ friend_requests SELECT (outgoing) falló:', outResp.error.message);
        } else {
          outData = outResp.data as any;
        }

        const inResp = await supabase
          .from('friend_requests')
          .select('id, sender_id, recipient_id, status, created_at')
          .eq('recipient_id', user!.id);
        if (inResp.error) {
          console.warn('⚠️ friend_requests SELECT (incoming) falló:', inResp.error.message);
        } else {
          inData = inResp.data as any;
        }

        outgoing = (outData as FriendRequest[]) || [];
        incoming = (inData as FriendRequest[]) || [];
        setFriendRequests([...(outgoing || []), ...(incoming || [])]);

        // Asegurar perfiles completos para solicitudes (pueden no estar en "users")
        const relatedIds = Array.from(
          new Set([
            ...outgoing.map((r) => r.recipient_id),
            ...incoming.map((r) => r.sender_id),
          ].filter((id) => id && id !== user!.id))
        );
        if (relatedIds.length > 0) {
          const { data: reqProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url, email')
            .in('id', relatedIds);
          const map: Record<string, User> = {};
          (reqProfiles as User[] | null)?.forEach((p) => { map[p.id] = p; });
          setRequestProfiles(map);
        } else {
          setRequestProfiles({});
        }
      }

      // Filtrar según el filtro seleccionado
      const filteredUsers =
        filter === 'following'
          ? usersWithFollowing.filter((u: User) => u.is_following)
          : usersWithFollowing;

      console.log('✅ Filtered users to show:', filteredUsers.length);
      setUsers(filteredUsers);

      // Sugerencias: si no hay término de búsqueda, mostrar usuarios recientes con un blurb de su skill más reciente
      const rawQuery2 = (q ?? '').trim();
      const sanitizedQuery2 = rawQuery2.replace(/^@+/, '');
      if (sanitizedQuery2.length === 0) {
        try {
          const { data: recentProfiles } = await supabase
            .from('profiles')
            .select('id, username, full_name, bio, avatar_url, email')
            .neq('id', user!.id)
            .order('created_at', { ascending: false })
            .limit(12);

          const rec = (recentProfiles as User[]) || [];
          const recIds = rec.map((u) => u.id);
          let skillBlurbMap = new Map<string, string>();
          if (recIds.length > 0) {
            const { data: skillsData } = await supabase
              .from('skills')
              .select('user_id, title, is_offering, created_at')
              .in('user_id', recIds)
              .order('created_at', { ascending: false });
            const seen = new Set<string>();
            (skillsData || []).forEach((s: any) => {
              if (!seen.has(s.user_id)) {
                seen.add(s.user_id);
                const blurb = s.is_offering
                  ? `${t('people.suggest.offering')}: ${s.title}`
                  : `${t('people.suggest.seeking')}: ${s.title}`;
                skillBlurbMap.set(s.user_id, blurb);
              }
            });
          }
          const suggestedUsers: SuggestedUser[] = rec.map((u) => ({
            ...u,
            skillBlurb: skillBlurbMap.get(u.id),
          }));
          setSuggested(suggestedUsers);
        } catch (e) {
          setSuggested([]);
        }
      } else {
        setSuggested([]);
      }
    } catch (err) {
      console.error('❌ Fatal error in fetchUsers:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSearch = () => {
    setAppliedTerm(searchTerm);
  };

  const onKeyDownSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  };

  const toggleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        // Dejar de seguir
        await supabase
          .from('friendships')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', userId);
      } else {
        // Seguir
        await supabase
          .from('friendships')
          .insert({ follower_id: user!.id, following_id: userId });
      }
      
      // Actualizar lista
      await fetchUsers();
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  // Friend request actions
  const sendFriendRequest = async (targetId: string) => {
    try {
      await supabase.from('friend_requests').insert({ sender_id: user!.id, recipient_id: targetId, status: 'pending' });
      await fetchUsers(appliedTerm);
    } catch (e) {
      console.error('Error sending friend request', e);
    }
  };

  const acceptFriendRequest = async (req: FriendRequest) => {
    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', req.id)
        .eq('recipient_id', user!.id);

      // Crear relaciones de seguimiento en ambos sentidos (idempotente, ignorando duplicados)
      // Intento con upsert; si no está soportado, hacemos inserts con manejo de errores.
      const upsertSupported = true;
      if (upsertSupported) {
        await supabase
          .from('friendships')
          .upsert([
            { follower_id: user!.id, following_id: req.sender_id },
            { follower_id: req.sender_id, following_id: user!.id },
          ], { onConflict: 'follower_id,following_id', ignoreDuplicates: true } as any);
      } else {
        try {
          await supabase.from('friendships').insert({ follower_id: user!.id, following_id: req.sender_id });
        } catch {}
        try {
          await supabase.from('friendships').insert({ follower_id: req.sender_id, following_id: user!.id });
        } catch {}
      }

      await fetchUsers(appliedTerm);
    } catch (e) {
      console.error('Error accepting friend request', e);
    }
  };

  const rejectFriendRequest = async (req: FriendRequest) => {
    try {
      await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', req.id)
        .eq('recipient_id', user!.id);
      await fetchUsers(appliedTerm);
    } catch (e) {
      console.error('Error rejecting friend request', e);
    }
  };

  // La lista ya viene filtrada por servidor y por el filtro "Siguiendo"
  const filteredUsers = users;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Separate incoming and outgoing requests
  const incomingRequests = friendRequests.filter(r => r.recipient_id === user!.id && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.sender_id === user!.id && r.status === 'pending');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {tt('people.title', 'Personas')}
        </h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setActiveTab('people')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              activeTab === 'people'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tt('people.title', 'Personas')}
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg font-medium transition relative ${
              activeTab === 'requests'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tt('people.requests.tab', 'Solicitudes')}
            {(incomingRequests.length > 0 || outgoingRequests.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {incomingRequests.length + outgoingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'people' && (
          <div className="flex flex-col md:flex-row gap-3">
            {/* Buscador */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={tt('people.search.placeholder', 'Buscar personas...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onKeyDownSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="button"
              onClick={triggerSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              {tt('people.search.button', 'Buscar')}
            </button>

            {/* Filtro */}
            <label htmlFor="people-filter" className="sr-only">
              {tt('people.filter.label', 'Filtro')}
            </label>
            <select
              id="people-filter"
              aria-label={tt('people.filter.label', 'Filtro')}
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'following')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{tt('people.filter.all', 'Todos')}</option>
              <option value="following">{tt('people.filter.following', 'Siguiendo')}</option>
            </select>
          </div>
        )}
      </div>

      {activeTab === 'people' && (
        <>
          {/* Lista de usuarios */}
          {/* Sugerencias de usuarios recientes */}
          {suggested.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h3 className="text-lg font-bold mb-4">{tt('people.suggest.title', 'Usuarios recientes')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggested.map((person) => (
                  <div key={`sugg-${person.id}`} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition">
                    <div className="flex items-start gap-3 mb-3">
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt={person.username} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(person.email || person.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{person.email || person.username}</div>
                        {(person.full_name || person.username) && (
                          <div className="text-xs text-gray-500 truncate italic">{person.full_name || person.username}</div>
                        )}
                      </div>
                    </div>
                    {/* En recientes solo mostramos email y un nombre elegante (secundario) */}
                    <button
                      onClick={() => sendFriendRequest(person.id)}
                      className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      {tt('people.requests.addFriend', 'Agregar amigo')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((person) => (
              <div
                key={person.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <div className="p-6">
                  {/* Avatar */}
                  <div className="flex items-start gap-4 mb-4">
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt={person.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                        {person.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{person.email || person.username}</h3>
                      {(person.full_name || person.username) && (
                        <p className="text-sm text-gray-500 truncate italic">{person.full_name || person.username}</p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {person.bio && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{person.bio}</p>
                  )}

                  {/* Acciones de amistad */}
                  {(() => {
                    const outgoing = friendRequests.find((r) => r.sender_id === user!.id && r.recipient_id === person.id && r.status === 'pending');
                    const incoming = friendRequests.find((r) => r.sender_id === person.id && r.recipient_id === user!.id && r.status === 'pending');
                    const accepted = friendRequests.find((r) =>
                      (r.sender_id === user!.id && r.recipient_id === person.id && r.status === 'accepted') ||
                      (r.sender_id === person.id && r.recipient_id === user!.id && r.status === 'accepted')
                    );

                    if (accepted) {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                            {tt('people.requests.friends', 'Amigos')}
                          </span>
                          <button
                            onClick={() => onViewProfile && onViewProfile(person.id)}
                            className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            {tt('people.requests.viewProfile', 'Ver perfil')}
                          </button>
                          {onStartChat && (
                            <button
                              onClick={() => onStartChat(person.id, person.username)}
                              className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {tt('people.requests.message', 'Enviar mensaje')}
                            </button>
                          )}
                        </div>
                      );
                    }
                    if (incoming) {
                      return (
                        <div className="flex gap-2">
                          <button onClick={() => acceptFriendRequest(incoming)} className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                            {tt('people.requests.accept', 'Aceptar')}
                          </button>
                          <button onClick={() => rejectFriendRequest(incoming)} className="flex-1 py-2 px-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm">
                            {tt('people.requests.reject', 'Rechazar')}
                          </button>
                        </div>
                      );
                    }
                    if (outgoing) {
                      return (
                        <div className="w-full py-2 px-3 rounded-lg bg-yellow-50 text-yellow-800 text-center text-sm font-medium">
                          {tt('people.requests.sent', 'Solicitud enviada')}
                        </div>
                      );
                    }
                    return (
                      <button
                        onClick={() => sendFriendRequest(person.id)}
                        className="w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <UserPlus className="w-4 h-4" />
                        {tt('people.requests.addFriend', 'Agregar amigo')}
                      </button>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>

          {/* Sin resultados */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{tt('people.noResults', 'No se encontraron personas')}</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Toolbar solicitudes */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={() => fetchUsers(appliedTerm)}
              className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              {tt('people.requests.refresh', 'Actualizar')}
            </button>
          </div>
          {/* Incoming Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-bold mb-4">{tt('people.requests.incoming', 'Solicitudes recibidas')}</h3>
            {incomingRequests.length === 0 ? (
              <p className="text-gray-600">{tt('people.requests.noIncoming', 'No tienes solicitudes entrantes')}</p>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map((req) => {
                  const sender = requestProfiles[req.sender_id] || users.find(u => u.id === req.sender_id);
                  return (
                    <div key={req.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {sender?.avatar_url ? (
                          <img src={sender.avatar_url} alt={sender.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(sender?.email || sender?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{sender?.email || sender?.username}</div>
                          {(sender?.full_name || sender?.username) && (
                            <div className="text-sm text-gray-500 italic">{sender?.full_name || sender?.username}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => acceptFriendRequest(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          {tt('people.requests.accept', 'Aceptar')}
                        </button>
                        <button
                          onClick={() => rejectFriendRequest(req)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
                        >
                          <X className="w-4 h-4" />
                          {tt('people.requests.reject', 'Rechazar')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-lg font-bold mb-4">{tt('people.requests.outgoing', 'Solicitudes enviadas')}</h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-gray-600">{tt('people.requests.noOutgoing', 'No tienes solicitudes enviadas')}</p>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map((req) => {
                  const recipient = requestProfiles[req.recipient_id] || users.find(u => u.id === req.recipient_id);
                  return (
                    <div key={req.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        {recipient?.avatar_url ? (
                          <img src={recipient.avatar_url} alt={recipient.username} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {(recipient?.email || recipient?.username || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold">{recipient?.email || recipient?.username}</div>
                          {(recipient?.full_name || recipient?.username) && (
                            <div className="text-sm text-gray-500 italic">{recipient?.full_name || recipient?.username}</div>
                          )}
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-yellow-50 text-yellow-800 text-sm font-medium">
                        {tt('people.requests.sent', 'Solicitud enviada')}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
