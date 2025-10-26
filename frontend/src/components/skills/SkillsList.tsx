import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, User, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Skill {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  is_offering: boolean;
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

  const categories = ['Programming', 'Design', 'Marketing', 'Writing', 'Business', 'Music', 'Languages', 'Other'];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    const { data, error } = await supabase
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

    if (!error && data) {
      setSkills(data as Skill[]);
    }
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'offering' | 'seeking')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="offering">Offering</option>
              <option value="seeking">Seeking</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSkills.map((skill) => (
          <div
            key={skill.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
          >
            <div className={`h-2 ${skill.is_offering ? 'bg-blue-500' : 'bg-orange-500'}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{skill.title}</h3>
                  <span className="text-sm text-gray-500">{skill.category}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    skill.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                  }`}
                >
                  {skill.is_offering ? 'Offering' : 'Seeking'}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-3">{skill.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(skill.level)}`}>
                  {skill.level}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {skill.profiles.full_name || skill.profiles.username}
                  </span>
                </div>
                {skill.user_id !== user?.id && (
                  <button
                    onClick={() => onStartChat(skill.user_id, skill.profiles.username)}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                  >
                    Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No skills found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
