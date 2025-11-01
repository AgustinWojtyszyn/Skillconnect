import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, User, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';

interface Skill {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  is_offering: boolean;
  visibility: 'public' | 'friends';
  created_at: string;
  profiles: {
    username: string;
    full_name: string | null;
    location: string | null;
  };
}

interface SkillsListProps {
  onStartChat: (userId: string, username: string) => void;
}

export function SkillsList({ onStartChat }: SkillsListProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'offering' | 'seeking'>('all');
  const { user } = useAuth();
  const { t } = useI18n();

  const categories = ['programming', 'design', 'marketing', 'writing', 'business', 'music', 'languages', 'other'];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    
    // Obtener skills y friendships
    const { data: skillsData, error: skillsError } = await supabase
      .from('skills')
      .select(`
        *,
        profiles (
          username,
          full_name,
          location
        )
      `)
      .order('created_at', { ascending: false });

    if (skillsError || !skillsData) {
      setLoading(false);
      return;
    }

    // Obtener lista de usuarios que sigo
    const { data: friendshipsData } = await supabase
      .from('friendships')
      .select('following_id')
      .eq('follower_id', user?.id);

    const followingIds = new Set(friendshipsData?.map((f: { following_id: string }) => f.following_id) || []);

    // Filtrar skills según visibilidad
    const visibleSkills = skillsData.filter((skill: Skill) => {
      // Siempre mostrar mis propias skills
      if (skill.user_id === user?.id) return true;
      
      // Si es pública, mostrar a todos
      if (skill.visibility === 'public') return true;
      
      // Si es 'friends', mostrar solo si sigo al usuario
      if (skill.visibility === 'friends') {
        return followingIds.has(skill.user_id);
      }
      
      return false;
    });

    setSkills(visibleSkills as Skill[]);
    setLoading(false);
  };

  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesType =
      filterType === 'all' ||
      (filterType === 'offering' && skill.is_offering) ||
      (filterType === 'seeking' && !skill.is_offering);

    return matchesSearch && matchesCategory && matchesType;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder={t('skills.search.placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="category-select" className="sr-only">
              {t('skills.filterCategory')}
            </label>
            <select
              id="category-select"
              aria-label={t('skills.filterCategory')}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('skills.filter.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {t(`profile.category.${cat}`)}
                </option>
              ))}
            </select>

            <label htmlFor="type-select" className="sr-only">
              {t('skills.filterType')}
            </label>
            <select
              id="type-select"
              aria-label={t('skills.filterType')}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'offering' | 'seeking')}
              className="flex-1 sm:flex-none px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">{t('skills.filter.allTypes')}</option>
              <option value="offering">{t('skills.offering')}</option>
              <option value="seeking">{t('skills.seeking')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className={`h-2 ${skill.is_offering ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
            <div className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 truncate">{skill.title}</h3>
                  <span className="text-xs md:text-sm text-gray-500">{t(`profile.category.${skill.category}`)}</span>
                </div>
                <span
                  className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold flex-shrink-0 ${
                    skill.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {skill.is_offering ? t('profile.skill.offering') : t('profile.skill.seeking')}
                </span>
              </div>

              <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 line-clamp-3">{skill.description}</p>

              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getLevelColor(skill.level)}`}>
                  {t(`profile.level.${skill.level}`)}
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-3 md:pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 min-w-0">
                  <User className="w-3 h-3 md:w-4 md:h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs md:text-sm font-medium text-gray-700 truncate">
                    {skill.profiles.full_name || skill.profiles.username}
                  </span>
                </div>
                {skill.user_id !== user?.id ? (
                  <button
                    onClick={() => {
                      console.log('Chat button clicked:', { userId: skill.user_id, username: skill.profiles.username });
                      onStartChat(skill.user_id, skill.profiles.username);
                    }}
                    className="w-full px-3 md:px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm md:text-base font-bold rounded-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Enviar mensaje
                  </button>
                ) : (
                  <div className="w-full px-3 py-2 bg-gray-100 text-gray-500 text-xs md:text-sm text-center rounded-lg italic">
                    Tu publicación
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-8 md:py-12">
          <Filter className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-600">{t('skills.noResults')}</p>
        </div>
      )}
    </div>
  );
}
