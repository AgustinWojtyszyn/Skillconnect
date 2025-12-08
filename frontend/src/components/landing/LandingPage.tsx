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
    <div className="relative font-sans bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 min-h-screen">
      <img src="/assets/tech-bg.svg" alt="Tech background" className="absolute top-0 left-0 w-full h-40 md:h-56 object-cover pointer-events-none select-none animate-pulse" style={{zIndex:0, opacity:0.3}} />
      <div className="rounded-3xl p-8 text-cyan-200 shadow-neon relative z-10 border-2 border-cyan-400 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950" style={{ boxShadow: '0 0 32px #0ff, 0 0 8px #a0f', backgroundImage: 'linear-gradient(120deg, #0ff 0%, #00f 50%, #a0f 100%)' }}>
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="mt-1 text-5xl sm:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_20px_#0ff] animate-float">
              SkillConnect
            </h1>
            <p className="mt-2 text-cyan-200 max-w-2xl animate-fade-in text-lg">
              Conecta, aprende y crece en la comunidad tech. Descubre habilidades, comparte conocimientos y haz networking con profesionales de todo el mundo.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-black font-bold px-4 py-2 rounded-xl border-2 border-cyan-400 shadow-neon hover:scale-105 transition">
                Explorar habilidades
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-400 to-cyan-400 text-black font-bold px-4 py-2 rounded-xl border-2 border-purple-400 shadow-neon hover:scale-105 transition">
                Completa tu perfil
              </button>
              <button className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-cyan-400 text-black font-bold px-4 py-2 rounded-xl border-2 border-blue-400 shadow-neon hover:scale-105 transition">
                Mensajes
              </button>
            </div>
          </div>
          <Sparkles className="w-12 h-12 text-cyan-400 animate-spin-slow" />
        </div>
      </div>
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
        <div className="bg-gray-950 border-2 border-cyan-400 rounded-2xl shadow-neon p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
          <h3 className="text-lg font-bold text-cyan-300 font-mono mb-2">Habilidades</h3>
          <p className="text-cyan-100 text-sm mb-2">Descubre y comparte tus skills con la comunidad.</p>
          <div className="mt-2 text-2xl font-extrabold text-cyan-200 font-mono">∞</div>
          <div className="mt-1 text-xs text-cyan-400">Skills totales</div>
        </div>
        <div className="bg-gray-950 border-2 border-purple-400 rounded-2xl shadow-neon p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
          <h3 className="text-lg font-bold text-purple-300 font-mono mb-2">Perfil</h3>
          <p className="text-purple-100 text-sm mb-2">Completa tu perfil y destaca en la red.</p>
          <div className="mt-2 text-2xl font-extrabold text-purple-200 font-mono">100%</div>
          <div className="mt-1 text-xs text-purple-400">Perfil completado</div>
        </div>
        <div className="bg-gray-950 border-2 border-blue-400 rounded-2xl shadow-neon p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
          <h3 className="text-lg font-bold text-blue-300 font-mono mb-2">Mensajes</h3>
          <p className="text-blue-100 text-sm mb-2">Conversa y haz networking con otros usuarios.</p>
          <div className="mt-2 text-2xl font-extrabold text-blue-200 font-mono">∞</div>
          <div className="mt-1 text-xs text-blue-400">Conexiones</div>
        </div>
      </div>
      <div className="mt-16 flex flex-wrap gap-8 justify-center items-center animate-fade-in">
        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-8" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Django_logo.svg" alt="Django" className="h-8" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JS" className="h-8" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg" alt="Git" className="h-8" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="HTML5" className="h-8" />
      </div>
      <div className="mt-20 max-w-4xl mx-auto animate-fade-in">
        <h2 className="text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-6 drop-shadow-[0_0_20px_#0ff]">Testimonios</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-950 border-2 border-cyan-400 rounded-2xl p-6 shadow-neon">
            <p className="text-cyan-200 text-lg font-mono">“SkillConnect me ayudó a encontrar mi primer trabajo remoto en tecnología.”</p>
            <div className="mt-4 text-cyan-400 font-bold">— Ana, Frontend Developer</div>
          </div>
          <div className="bg-gray-950 border-2 border-purple-400 rounded-2xl p-6 shadow-neon">
            <p className="text-purple-200 text-lg font-mono">“La comunidad es increíble y siempre hay alguien dispuesto a ayudar.”</p>
            <div className="mt-4 text-purple-400 font-bold">— Luis, Backend Engineer</div>
          </div>
        </div>
      </div>
    </div>
  );
}
