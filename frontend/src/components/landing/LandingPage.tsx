import { Sparkles, Globe, MessageCircle, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: (page: 'login' | 'register') => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t, lang } = useI18n();
  const { landingBgColor } = useTheme();
  const { user } = useAuth();

  // Convertir las clases de Tailwind a gradiente CSS
  const getLandingGradient = () => {
    const colorMap: Record<string, string> = {
      'from-blue-900 via-indigo-800 to-purple-900': 'linear-gradient(to bottom right, #1e3a8a, #3730a3, #581c87)',
      'from-blue-600 via-indigo-600 to-purple-600': 'linear-gradient(to bottom right, #2563eb, #4f46e5, #7c3aed)',
      'from-emerald-900 via-teal-800 to-cyan-900': 'linear-gradient(to bottom right, #064e3b, #115e59, #164e63)',
      'from-rose-900 via-pink-800 to-fuchsia-900': 'linear-gradient(to bottom right, #881337, #831843, #701a75)',
      'from-amber-900 via-orange-800 to-red-900': 'linear-gradient(to bottom right, #78350f, #9a3412, #7f1d1d)',
    };
    return colorMap[landingBgColor] || colorMap['from-blue-900 via-indigo-800 to-purple-900'];
  };

  return (
    <div className="relative font-sans min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
      {/* Header: Logo y selector de idioma */}
      <div className="w-full flex justify-between items-center px-4 pt-6 md:pt-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 md:gap-4">
          <Globe className="w-8 h-8 md:w-16 md:h-16 text-cyan-400 drop-shadow-2xl" />
          <span className="text-2xl xs:text-3xl md:text-5xl font-extrabold font-mono text-cyan-300 tracking-wide drop-shadow-2xl">SkillConnect</span>
        </div>
        {/* Botón de idioma eliminado, solo queda en Dashboard */}
      </div>
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none select-none" style={{zIndex:0, opacity:0.15}}>
        <img src="/assets/tech-bg.svg" alt="Tech background" className="w-full h-20 xs:h-32 md:h-64 object-cover" />
      </div>
      <section className="max-w-6xl mx-auto pt-28 md:pt-16 pb-10 px-3 md:px-4">
        <header className="mb-10 md:mb-12">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-lg mb-6 max-w-2xl text-center md:text-left leading-tight">
            {t('landing.title.1')} <span className="text-cyan-400">{t('landing.title.2')}</span> {t('landing.title.3')}
          </h1>
          <div className="bg-gray-900/80 border border-cyan-700 rounded-xl p-4 xs:p-5 md:p-6 mb-6 md:mb-6 max-w-2xl shadow-lg mx-auto md:mx-0">
            <p className="text-sm xs:text-base sm:text-xl md:text-2xl text-cyan-200 font-light leading-relaxed text-center md:text-left">
              {t('landing.subtitle')}
            </p>
          </div>
        </header>
        {/* Renderizado condicional según autenticación */}
        {!user ? (
          <>
            {/* CTA principal para no autenticados */}
            <div className="flex flex-col gap-3 w-full max-w-xs mx-auto mb-10 md:flex-row md:max-w-none md:justify-start md:mb-12">
              <button
                className="bg-cyan-700 hover:bg-cyan-800 text-white font-bold px-6 py-3 rounded-xl shadow border border-cyan-400 transition w-full md:w-auto text-lg md:text-base"
                onClick={() => onGetStarted('register')}
              >
                {t('landing.primaryCta')}
              </button>
              <button
                className="bg-gray-800 hover:bg-cyan-700 text-cyan-200 font-bold px-6 py-3 rounded-xl shadow border border-cyan-400 transition w-full md:w-auto text-lg md:text-base"
                onClick={() => onGetStarted('login')}
              >
                {t('auth.login.title')}
              </button>
            </div>
            {/* Secciones públicas: features, testimonios, logos, etc. */}
            {/* Logos de tecnologías */}
            <section className="flex gap-6 md:gap-10 justify-center items-center mb-12 md:mb-20 overflow-x-auto scrollbar-thin scrollbar-thumb-cyan-700 px-1 xs:px-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-6 xs:h-8 md:h-10" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JS" className="h-6 xs:h-8 md:h-10" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg" alt="Git" className="h-6 xs:h-8 md:h-10" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="HTML5" className="h-6 xs:h-8 md:h-10" />
            </section>
            {/* Testimonios */}
            <section className="max-w-5xl mx-auto mb-16 md:mb-24 px-2 xs:px-4 md:px-0">
              <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-6 xs:mb-8 md:mb-10 drop-shadow-lg text-center md:text-left">
                {t('landing.testimonials.title')}
              </h2>
              <div className="grid grid-cols-1 gap-6 xs:gap-8 md:grid-cols-2 md:gap-10">
                <div className="bg-gray-900 rounded-3xl p-5 xs:p-6 md:p-8 shadow-lg">
                  <p className="text-xs xs:text-base sm:text-lg text-gray-200 font-mono mb-2 xs:mb-4 md:mb-6">“{t('landing.testimonials.ana.text')}”</p>
                  <div className="text-cyan-400 font-bold text-xs xs:text-base">{t('landing.testimonials.ana.author')}</div>
                </div>
                <div className="bg-gray-900 rounded-3xl p-5 xs:p-6 md:p-8 shadow-lg">
                  <p className="text-xs xs:text-base sm:text-lg text-gray-200 font-mono mb-2 xs:mb-4 md:mb-6">“{t('landing.testimonials.luis.text')}”</p>
                  <div className="text-purple-400 font-bold text-xs xs:text-base">{t('landing.testimonials.luis.author')}</div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Usuario autenticado: CTA y resumen privado */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 md:gap-8 mb-12 md:mb-16 px-1 xs:px-2">
              <div className="bg-gray-900 rounded-3xl p-5 xs:p-6 md:p-8 shadow-lg flex flex-col justify-between h-full min-h-[180px] xs:min-h-[220px]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2" /></svg>
                    <h3 className="text-lg xs:text-xl font-bold text-cyan-300 font-mono">{t('dashboard.cards.skills.title')}</h3>
                  </div>
                  <p className="text-gray-300 text-sm xs:text-base mb-4">{t('dashboard.cards.skills.desc')}</p>
                </div>
                <div className="mt-4 text-2xl xs:text-3xl font-extrabold text-cyan-200 font-mono">∞</div>
                <div className="text-xs xs:text-sm text-cyan-400">{t('dashboard.cards.skills.total')}</div>
              </div>
              <div className="bg-gray-900 rounded-3xl p-5 xs:p-6 md:p-8 shadow-lg flex flex-col justify-between h-full min-h-[180px] xs:min-h-[220px]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
                    <h3 className="text-lg xs:text-xl font-bold text-purple-300 font-mono">{t('dashboard.cards.profile.title')}</h3>
                  </div>
                  <p className="text-gray-300 text-sm xs:text-base mb-4">{t('dashboard.cards.profile.desc')}</p>
                </div>
                <div className="mt-4 text-2xl xs:text-3xl font-extrabold text-purple-200 font-mono">100%</div>
                <div className="text-xs xs:text-sm text-purple-400">{t('dashboard.cards.profile.cta')}</div>
                <button
                  className="w-full bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow-md transition"
                  onClick={() => onGetStarted && onGetStarted('register')}
                >
                  Abrir mi perfil
                </button>
              </div>
              <div className="bg-gray-900 rounded-3xl p-5 xs:p-6 md:p-8 shadow-lg flex flex-col justify-between h-full min-h-[180px] xs:min-h-[220px]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 xs:w-6 xs:h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                    <h3 className="text-lg xs:text-xl font-bold text-blue-300 font-mono">{t('dashboard.cards.chat.title')}</h3>
                  </div>
                  <p className="text-gray-300 text-sm xs:text-base mb-4">{t('dashboard.cards.chat.desc')}</p>
                </div>
                <div className="mt-4 text-2xl xs:text-3xl font-extrabold text-blue-200 font-mono">∞</div>
                <div className="text-xs xs:text-sm text-blue-400">{t('dashboard.cards.chat.cta')}</div>
                <button
                  className="w-full bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-4 py-2 rounded-xl shadow-md transition"
                  onClick={() => onGetStarted && onGetStarted('login')}
                >
                  Abrir el chat
                </button>
              </div>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
