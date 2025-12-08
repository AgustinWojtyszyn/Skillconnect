import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, MessageCircle, User, Layers, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardHomeProps {
  onGoTo: (view: 'skills' | 'profile' | 'chat') => void;
}

export function DashboardHome({ onGoTo }: DashboardHomeProps) {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { bannerColor } = useTheme();
  const displayName = useMemo(
    () => (user?.user_metadata?.username as string) || (user?.email as string) || 'Usuario',
    [user]
  );

  const [totalSkills, setTotalSkills] = useState<number | null>(null);
  const [mySkills, setMySkills] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCounts() {
      try {
        if (!supabase) return;
        const total = await supabase.from('skills').select('id', { count: 'exact', head: true });
        const mine = user
          ? await supabase
              .from('skills')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
          : { count: null };
        if (!cancelled) {
          setTotalSkills(total?.count ?? null);
          setMySkills(mine?.count ?? null);
        }
      } catch (_) {
        // Silenciar fallos y dejar nulls
      }
    }
    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Convertir las clases de Tailwind a gradiente CSS
  const getBannerGradient = () => {
    const colorMap: Record<string, string> = {
      'from-blue-600 via-indigo-600 to-purple-600': 'linear-gradient(to right, #2563eb, #4f46e5, #7c3aed)',
      'from-blue-900 via-indigo-800 to-purple-900': 'linear-gradient(to right, #1e3a8a, #3730a3, #581c87)',
      'from-emerald-600 via-teal-600 to-cyan-600': 'linear-gradient(to right, #059669, #0d9488, #0891b2)',
      'from-rose-600 via-pink-600 to-fuchsia-600': 'linear-gradient(to right, #e11d48, #db2777, #c026d3)',
      'from-amber-600 via-orange-600 to-red-600': 'linear-gradient(to right, #d97706, #ea580c, #dc2626)',
    };
    return colorMap[bannerColor] || colorMap['from-blue-600 via-indigo-600 to-purple-600'];
  };

  return (
    <div className="relative font-sans min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Botón de idioma en esquina superior derecha */}
      <button
        className="absolute top-6 right-6 z-20 bg-gray-900 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg font-mono text-sm shadow hover:bg-cyan-900 transition"
        onClick={() => setLang && setLang(lang === 'es' ? 'en' : 'es')}
        aria-label="Cambiar idioma"
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>
      <div className="absolute inset-0 pointer-events-none select-none" style={{zIndex:0, opacity:0.15}}>
        <img src="/assets/tech-bg.svg" alt="Tech background" className="w-full h-64 object-cover" />
      </div>
      <section className="max-w-6xl mx-auto pt-16 pb-8 px-4">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-lg mb-4">Bienvenido, {displayName}</h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-3xl font-light leading-relaxed mb-6">
            Accede a tus habilidades, perfil y mensajes. Organiza tu experiencia y conecta con la comunidad tech.
          </p>
          <div className="flex flex-wrap gap-4 mt-4">
            <button onClick={() => onGoTo('skills')} className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Explorar habilidades</button>
            <button onClick={() => onGoTo('profile')} className="bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Completa tu perfil</button>
            <button onClick={() => onGoTo('chat')} className="bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-6 py-3 rounded-xl shadow-md transition">Mensajes</button>
          </div>
        </header>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2" /></svg>
                <h3 className="text-xl font-bold text-cyan-300 font-mono">Habilidades</h3>
              </div>
              <p className="text-gray-300 text-base mb-4">Tus skills y las de la comunidad.</p>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-cyan-200 font-mono">{totalSkills ?? '—'}</div>
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
            <div className="mt-4 text-3xl font-extrabold text-purple-200 font-mono">{mySkills ?? '—'}</div>
            <div className="text-sm text-purple-400">Tus skills</div>
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
