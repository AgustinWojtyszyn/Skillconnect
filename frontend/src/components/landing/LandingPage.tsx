import { Sparkles, Globe, MessageCircle, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t, lang, setLang } = useI18n();
  const { landingBgColor } = useTheme();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Hero Section con fondo SVG tech animado */}
      <div 
        className="relative overflow-hidden"
        style={{ backgroundImage: getLandingGradient() }}
      >
        <img src="/assets/tech-bg.svg" alt="Tech background" className="absolute inset-0 w-full h-32 md:h-40 lg:h-56 object-cover pointer-events-none select-none animate-pulse" style={{zIndex:0, opacity:0.7}} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          {/* Language switcher */}
          <div className="flex justify-end mb-6">
            <div className="inline-flex rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm shadow-lg">
              <button
                onClick={() => setLang('es')}
                className={`px-3 py-1.5 text-sm rounded-l-lg transition ${lang === 'es' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}
              >ES</button>
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-sm rounded-r-lg border-l border-white/20 transition ${lang === 'en' ? 'bg-white text-blue-900' : 'text-white hover:bg-white/20'}`}
              >EN</button>
            </div>
          </div>
          <div className="text-center space-y-8">
            {/* Logo y título en línea con lema debajo */}
            <div className="mb-8 flex flex-col items-center justify-center py-10 animate-fade-in">
              <div className="flex flex-row items-center justify-center gap-4 md:gap-6 animate-float">
                {/* Título SkillsConnect */}
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                  <span className="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                    SkillsConnect
                  </span>
                </h1>

                {/* Logo a la derecha */}
                <img
                  src="/assets/modern-technology-world-map-globe-crop-out-png.webp"
                  alt="SkillsConnect logo"
                  className="w-16 md:w-24 h-auto drop-shadow-2xl select-none pointer-events-none"
                  loading="eager"
                  decoding="async"
                />
              </div>
              
              {/* Lema debajo del título y logo */}
              <p className="mt-3 text-base md:text-xl text-blue-200 font-light tracking-wide">
                {lang === 'es' ? 'Aprende, Ofrece, Colabora' : 'Learn, Offer, Collaborate'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full text-sm font-semibold animate-pulse">
              <Sparkles className="w-4 h-4" />
              {t('landing.badge')}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg animate-fade-in">
              {t('landing.title.1')} <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{t('landing.title.2')}</span>
              <br />
              {t('landing.title.3')}
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-float">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                {t('landing.primaryCta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-blue-100 pt-8 animate-fade-in">
                    {/* Testimonios y partners */}
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                      <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Testimonios</h2>
                        <p className="text-lg text-gray-600">Lo que dicen nuestros usuarios</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                          <p className="text-gray-700 italic mb-4">“SkillsConnect me permitió encontrar mentores y crecer profesionalmente en tiempo récord.”</p>
                          <div className="flex items-center gap-3">
                            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Testimonio" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold text-gray-900">Juan P.</div>
                              <div className="text-xs text-gray-500">Desarrollador</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                          <p className="text-gray-700 italic mb-4">“La comunidad es súper activa y siempre hay alguien dispuesto a ayudar.”</p>
                          <div className="flex items-center gap-3">
                            <img src="https://randomuser.me/api/portraits/women/44.jpg" alt="Testimonio" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold text-gray-900">María G.</div>
                              <div className="text-xs text-gray-500">Diseñadora UX</div>
                            </div>
                          </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in">
                          <p className="text-gray-700 italic mb-4">“Me conecté con empresas y conseguí mi primer trabajo remoto.”</p>
                          <div className="flex items-center gap-3">
                            <img src="https://randomuser.me/api/portraits/men/65.jpg" alt="Testimonio" className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <div className="font-semibold text-gray-900">Lucas R.</div>
                              <div className="text-xs text-gray-500">Estudiante IT</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-16 text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Partners</h3>
                        <div className="flex flex-wrap gap-8 justify-center items-center">
                          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-10" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Django_logo.svg" alt="Django" className="h-10" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JS" className="h-10" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg" alt="Git" className="h-10" />
                          <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="HTML5" className="h-10" />
                        </div>
                      </div>
                    </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>{t('landing.perk.free')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>{t('landing.perk.cardless')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-300" />
                <span>{t('landing.perk.community')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('landing.why')}</h2>
          <p className="text-xl text-gray-600">{t('landing.why.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.feature.global.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('landing.feature.global.desc')}</p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.feature.chat.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('landing.feature.chat.desc')}</p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('landing.feature.growth.title')}</h3>
            <p className="text-gray-600 leading-relaxed">{t('landing.feature.growth.desc')}</p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">{t('landing.stats.global')}</div>
              <div className="text-blue-100 text-lg">Borderless</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{t('landing.stats.free')}</div>
              <div className="text-blue-100 text-lg">{t('landing.perk.free')}</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">{t('landing.stats.unrestricted')}</div>
              <div className="text-blue-100 text-lg">Open & inclusive</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">100%</div>
              <div className="text-blue-100 text-lg">{t('landing.stats.satisfaction')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('landing.cta.title')}</h2>
        <p className="text-xl text-gray-600 mb-8">{t('landing.cta.subtitle')}</p>
        <button
          onClick={onGetStarted}
          className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
        >
          {t('landing.cta.button')}
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg mb-2">SkillsConnect - Conectando talento y conocimiento</p>
          <p className="text-sm">© 2025</p>
        </div>
      </footer>
    </div>
  );
}
