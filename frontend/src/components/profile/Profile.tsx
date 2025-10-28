import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { User, MapPin, Edit2, Plus, Trash2, Save, X } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  location: string | null;
}

interface Skill {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'expert';
  is_offering: boolean;
}

const categories = ['Programming', 'Design', 'Marketing', 'Writing', 'Business', 'Music', 'Languages', 'Other'];

export function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    bio: '',
    location: '',
  });

  const [skillForm, setSkillForm] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'expert',
    is_offering: true,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSkills();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
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
    const { error } = await supabase
      .from('profiles')
      .update(profileForm)
      .eq('id', user!.id);

    if (!error) {
      setProfile({ ...profile!, ...profileForm });
      setEditingProfile(false);
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
      category: 'Programming',
      level: 'intermediate',
      is_offering: true,
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
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-4 rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile?.full_name || profile?.username}
              </h2>
              <p className="text-gray-500">@{profile?.username}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-2"
          >
            {editingProfile ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
                title="Full Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Bio"
                placeholder="Enter your bio"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={profileForm.location}
                onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Location"
                placeholder="Enter your location"
              />
            </div>
            <button
              onClick={updateProfile}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {profile?.bio && <p className="text-gray-700">{profile.bio}</p>}
            {profile?.location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">My Skills</h3>
          <button
            onClick={() => setShowSkillForm(!showSkillForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>

        {showSkillForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                    type="text"
                    value={skillForm.title}
                    onChange={(e) => setSkillForm({ ...skillForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    title="Skill Title"
                    placeholder="Enter skill title"
                  />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <label htmlFor="skill-category-select" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  id="skill-category-select"
                  value={skillForm.category}
                  onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={skillForm.description}
                onChange={(e) => setSkillForm({ ...skillForm, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Skill Description"
                placeholder="Enter skill description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <label htmlFor="skill-level-select" className="sr-only">Skill Level</label>
                <select
                  id="skill-level-select"
                  value={skillForm.level}
                  onChange={(e) => setSkillForm({ ...skillForm, level: e.target.value as any })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <label htmlFor="skill-type-select" className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  id="skill-type-select"
                  value={skillForm.is_offering ? 'offering' : 'seeking'}
                  onChange={(e) => setSkillForm({ ...skillForm, is_offering: e.target.value === 'offering' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="offering">Offering</option>
                  <option value="seeking">Seeking</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={saveSkill}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingSkill ? 'Update' : 'Add'} Skill
              </button>
              <button
                onClick={resetSkillForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{skill.title}</h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        skill.is_offering ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {skill.is_offering ? 'Offering' : 'Seeking'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{skill.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{skill.category}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500 capitalize">{skill.level}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditSkill(skill)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit Skill"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSkill(skill.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {skills.length === 0 && (
            <p className="text-center text-gray-500 py-8">No skills added yet. Add your first skill!</p>
          )}
        </div>
      </div>
    </div>
  );
}
