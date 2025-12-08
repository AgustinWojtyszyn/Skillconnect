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
    <div className="relative font-sans min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="absolute inset-0 pointer-events-none select-none" style={{zIndex:0, opacity:0.15}}>
        <img src="/assets/tech-bg.svg" alt="Tech background" className="w-full h-64 object-cover" />
      </div>
      <section className="max-w-6xl mx-auto pt-16 pb-8 px-4">
        <header className="mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-lg mb-4">SkillConnect</h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-3xl font-light leading-relaxed mb-6">
            Conecta, aprende y crece en la comunidad tech. Descubre habilidades, comparte conocimientos y haz networking con profesionales de todo el mundo.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Explorar habilidades</button>
            <button className="bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Completa tu perfil</button>
            <button className="bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Mensajes</button>
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2" /></svg>
                <h3 className="text-xl font-bold text-cyan-300 font-mono">Habilidades</h3>
              </div>
              <p className="text-gray-300 text-base mb-4">Descubre y comparte tus skills con la comunidad.</p>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-cyan-200 font-mono">∞</div>
            <div className="text-sm text-cyan-400">Skills totales</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a7.5 7.5 0 0 1 13 0" /></svg>
                <h3 className="text-xl font-bold text-purple-300 font-mono">Perfil</h3>
              </div>
              <p className="text-gray-300 text-base mb-4">Completa tu perfil y destaca en la red.</p>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-purple-200 font-mono">100%</div>
            <div className="text-sm text-purple-400">Perfil completado</div>
          </div>
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                <h3 className="text-xl font-bold text-blue-300 font-mono">Mensajes</h3>
              </div>
              <p className="text-gray-300 text-base mb-4">Conversa y haz networking con otros usuarios.</p>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-blue-200 font-mono">∞</div>
            <div className="text-sm text-blue-400">Conexiones</div>
          </div>
        </section>
        <section className="flex flex-wrap gap-10 justify-center items-center mb-20">
          <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-10" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Django_logo.svg" alt="Django" className="h-10" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JS" className="h-10" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg" alt="Git" className="h-10" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="HTML5" className="h-10" />
        </section>
        <section className="max-w-5xl mx-auto mb-24">
          <h2 className="text-3xl md:text-4xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-10 drop-shadow-lg">Testimonios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-gray-200 font-mono mb-6">“SkillConnect me ayudó a encontrar mi primer trabajo remoto en tecnología.”</p>
              <div className="text-cyan-400 font-bold">Ana, Frontend Developer</div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 shadow-lg">
              <p className="text-lg text-gray-200 font-mono mb-6">“La comunidad es increíble y siempre hay alguien dispuesto a ayudar.”</p>
              <div className="text-purple-400 font-bold">Luis, Backend Engineer</div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
