import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { UserPlus, UserMinus, Search, Users } from 'lucide-react';

interface User {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_following?: boolean;
}

export function PeoplePage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'following'>('all');

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Obtener lista de usuarios
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, bio, avatar_url')
        .neq('id', user!.id);

      if (profilesError) throw profilesError;

      // Obtener amistades del usuario actual
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('following_id')
        .eq('follower_id', user!.id);

      if (friendshipsError) throw friendshipsError;

      const followingIds = new Set(
        friendships?.map((f: { following_id: string }) => f.following_id) || []
      );

      const usersWithFollowing = profiles?.map((p: User) => ({
        ...p,
        is_following: followingIds.has(p.id)
      })) || [];

      // Filtrar según el filtro seleccionado
      let filteredUsers = usersWithFollowing;
      if (filter === 'following') {
        filteredUsers = usersWithFollowing.filter((u: User) => u.is_following);
      }

      setUsers(filteredUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
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

  const term = searchTerm.trim().toLowerCase();
  const norm = (s?: string | null) => (s || '').toLowerCase();
  const filteredUsers = users.filter((u) =>
    norm(u.username).includes(term) || norm(u.full_name).includes(term)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {t('people.title')}
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('people.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro */}
          <label htmlFor="people-filter" className="sr-only">
            {t('people.filter.label')}
          </label>
          <select
            id="people-filter"
            aria-label={t('people.filter.label')}
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'following')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('people.filter.all')}</option>
            <option value="following">{t('people.filter.following')}</option>
          </select>
        </div>
      </div>

      {/* Lista de usuarios */}
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
                  <h3 className="font-bold text-lg truncate">
                    {person.full_name || person.username}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">@{person.username}</p>
                </div>
              </div>

              {/* Bio */}
              {person.bio && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{person.bio}</p>
              )}

              {/* Botón seguir/siguiendo */}
              <button
                onClick={() => toggleFollow(person.id, person.is_following || false)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  person.is_following
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {person.is_following ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    {t('people.unfollow')}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t('people.follow')}
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Sin resultados */}
      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t('people.noResults')}</p>
        </div>
      )}
    </div>
  );
}
