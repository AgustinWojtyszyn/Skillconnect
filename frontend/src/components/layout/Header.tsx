import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { LogOut, User, MessageCircle, Home, BookOpen, Languages } from 'lucide-react';

interface HeaderProps {
  currentView: 'skills' | 'profile' | 'chat';
  onViewChange: (view: 'skills' | 'profile' | 'chat') => void;
  onShowTutorial?: () => void;
}

export function Header({ currentView, onViewChange, onShowTutorial }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { t, lang, toggleLang } = useI18n();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
            <nav className="hidden md:flex gap-2">
              <button
                onClick={() => onViewChange('skills')}
                className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                  currentView === 'skills'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home className="w-4 h-4" />
                {t('nav.skills')}
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
        <nav className="flex justify-around">
          <button
            onClick={() => onViewChange('skills')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentView === 'skills' ? 'text-blue-700' : 'text-gray-600'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">{t('nav.skills')}</span>
          </button>
          <button
            onClick={() => onViewChange('profile')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentView === 'profile' ? 'text-blue-700' : 'text-gray-600'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{t('nav.profile')}</span>
          </button>
          <button
            onClick={() => onViewChange('chat')}
            className={`flex-1 py-3 flex flex-col items-center gap-1 ${
              currentView === 'chat' ? 'text-blue-700' : 'text-gray-600'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">{t('nav.messages')}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
