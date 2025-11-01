import { Sparkles, Globe, MessageCircle, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section con fondo azul integrado */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
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
            {/* Logo personalizado con mundo estático y detallado */}
            <div className="mb-8 flex flex-col items-center justify-center py-12">
              {/* Mundo SVG con líneas y nodos */}
              <div className="relative mb-6">
                <svg
                  className="w-36 h-36 md:w-44 md:h-44 drop-shadow-2xl"
                  viewBox="0 0 200 200"
                  fill="none"
                  aria-label="SkillsConnect globe logo"
                >
                  <defs>
                    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="stroke" x1="0" y1="0" x2="200" y2="200">
                      <stop offset="0%" stopColor="#93C5FD" />
                      <stop offset="50%" stopColor="#A78BFA" />
                      <stop offset="100%" stopColor="#7C3AED" />
                    </linearGradient>
                  </defs>
                  {/* Glow */}
                  <circle cx="100" cy="100" r="80" fill="url(#glow)" />
                  {/* Esfera */}
                  <circle cx="100" cy="100" r="70" stroke="url(#stroke)" strokeWidth="2" />
                  {/* Meridianos */}
                  <ellipse cx="100" cy="100" rx="65" ry="28" stroke="url(#stroke)" strokeWidth="1.5" />
                  <ellipse cx="100" cy="100" rx="65" ry="42" stroke="url(#stroke)" strokeWidth="1.2" transform="rotate(25 100 100)" />
                  <ellipse cx="100" cy="100" rx="65" ry="42" stroke="url(#stroke)" strokeWidth="1.2" transform="rotate(-25 100 100)" />
                  {/* Paralelos curvos */}
                  <path d="M30,100 C60,85 140,85 170,100" stroke="url(#stroke)" strokeWidth="1.2" fill="none" />
                  <path d="M35,120 C80,105 120,105 165,120" stroke="url(#stroke)" strokeWidth="1" fill="none" />
                  <path d="M35,80 C80,95 120,95 165,80" stroke="url(#stroke)" strokeWidth="1" fill="none" />
                  {/* Órbitas finas */}
                  <path d="M25,110 C60,60 140,60 175,110" stroke="url(#stroke)" strokeWidth="0.8" fill="none" />
                  <path d="M25,90 C60,140 140,140 175,90" stroke="url(#stroke)" strokeWidth="0.8" fill="none" />
                  {/* Nodos */}
                  <g fill="#A78BFA">
                    <circle cx="55" cy="86" r="3" />
                    <circle cx="75" cy="120" r="3" />
                    <circle cx="125" cy="84" r="3" />
                    <circle cx="145" cy="114" r="3" />
                    <circle cx="100" cy="100" r="3" />
                  </g>
                </svg>
              </div>

              {/* Título SkillsConnect */}
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-3">
                <span className="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                  SkillsConnect
                </span>
              </h1>
              
              {/* Lema debajo */}
              <p className="text-lg md:text-2xl text-blue-200 font-light tracking-wide">
                {lang === 'es' ? 'Aprende, Ofrece, Colabora' : 'Learn, Offer, Collaborate'}
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-full text-sm font-semibold animate-bounce">
              <Sparkles className="w-4 h-4" />
              {t('landing.badge')}
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white leading-tight drop-shadow-lg">
              {t('landing.title.1')} <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">{t('landing.title.2')}</span>
              <br />
              {t('landing.title.3')}
            </h2>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={onGetStarted}
                className="group px-8 py-4 bg-white text-blue-900 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-white/30 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                {t('landing.primaryCta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-blue-100 pt-8">
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
