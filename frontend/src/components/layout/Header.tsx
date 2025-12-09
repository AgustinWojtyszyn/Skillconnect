import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { LogOut, User, MessageCircle, Home, BookOpen, Languages, Layers, Users, Briefcase } from 'lucide-react';
import { BackButton } from './BackButton';

interface HeaderProps {
  currentView: 'home' | 'skills' | 'profile' | 'chat' | 'people';
  onViewChange: (view: 'home' | 'skills' | 'profile' | 'chat' | 'people') => void;
  onShowTutorial?: () => void;
}

export function Header({ currentView, onViewChange, onShowTutorial }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm relative">
      <div className="absolute top-3 left-4 z-30">
        <BackButton />
      </div>
      <button
        className="absolute top-3 right-6 z-20 bg-gray-900 border border-cyan-400 text-cyan-200 px-3 py-1 rounded-lg font-mono text-xs shadow hover:bg-cyan-900 transition"
        onClick={toggleLang}
        aria-label="Cambiar idioma"
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
            <nav className="hidden md:flex gap-2">
              <button
                onClick={() => onViewChange('home')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                {t('nav.home')}
              </button>
              <button
                onClick={() => onViewChange('skills')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'skills'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-4 h-4" />
                {t('nav.skills')}
              </button>
              <button
                onClick={() => onViewChange('people')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'people'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="w-4 h-4" />
                {t('nav.people')}
              </button>
              <button
                onClick={() => onViewChange('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'profile'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User className="w-4 h-4" />
                {t('nav.profile')}
              </button>
              <button
                onClick={() => onViewChange('chat')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'chat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                {t('nav.messages')}
              </button>
              {onShowTutorial && (
                <button
                  onClick={onShowTutorial}
                  className="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-gray-600 hover:bg-gray-100"
                >
                  <BookOpen className="w-4 h-4" />
                  {t('nav.tutorial')}
                </button>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title={t('nav.language')}
            >
              <Languages className="w-4 h-4" />
              <span className="uppercase text-xs font-semibold">{lang}</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.signOut')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-gray-200">
                <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
          <div className="flex justify-around items-center h-16">
            <button
              onClick={() => onViewChange('home')}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                currentView === 'home' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">{t('nav.home')}</span>
            </button>
            <button
              onClick={() => onViewChange('skills')}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                currentView === 'skills' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Briefcase className="w-6 h-6" />
              <span className="text-xs mt-1">{t('nav.skills')}</span>
            </button>
            <button
              onClick={() => onViewChange('people')}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                currentView === 'people' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs mt-1">{t('nav.people')}</span>
            </button>
            <button
              onClick={() => onViewChange('profile')}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                currentView === 'profile' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">{t('nav.profile')}</span>
            </button>
            <button
              onClick={() => onViewChange('chat')}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                currentView === 'chat' ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs mt-1">{t('nav.messages')}</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
