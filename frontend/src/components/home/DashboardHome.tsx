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
  const { t } = useI18n();
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
    <div className="relative">
      {/* Fondo SVG tech animado */}
      <img src="/assets/tech-bg.svg" alt="Tech background" className="absolute top-0 left-0 w-full h-32 md:h-40 lg:h-56 object-cover pointer-events-none select-none animate-pulse" style={{zIndex:0, opacity:0.7}} />
      {/* Encabezado con gradiente */}
      <div 
        className="rounded-3xl p-8 text-white shadow-xl relative z-10"
        style={{ backgroundImage: getBannerGradient() }}
      >
        <div className="flex items-start justify-between gap-4 animate-fade-in">
          <div>
            <p className="text-sm/relaxed text-blue-100 animate-pulse">{t('dashboard.welcomeBadge')}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold animate-float">
              {t('dashboard.welcome', { name: displayName })}
            </h1>
            <p className="mt-2 text-blue-100 max-w-2xl animate-fade-in">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <Sparkles className="w-10 h-10 hidden sm:block text-white/80 animate-spin-slow" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => onGoTo('skills')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 transition text-white px-4 py-2 rounded-xl"
          >
            <Layers className="w-4 h-4" /> {t('dashboard.actions.exploreSkills')} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoTo('profile')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 transition text-white px-4 py-2 rounded-xl"
          >
            <User className="w-4 h-4" /> {t('dashboard.actions.completeProfile')} <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGoTo('chat')}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 transition text-white px-4 py-2 rounded-xl"
          >
            <MessageCircle className="w-4 h-4" /> {t('dashboard.actions.openMessages')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Widgets y tarjetas tech */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{t('dashboard.cards.skills.title')}</h3>
          </div>
          <p className="mt-3 text-gray-600">{t('dashboard.cards.skills.desc')}</p>
          <div className="mt-4 text-2xl font-extrabold text-gray-900">
            {totalSkills === null ? '—' : totalSkills}
            <span className="ml-2 text-sm font-medium text-gray-500">{t('dashboard.cards.skills.total')}</span>
          </div>
          <div className="mt-1 text-sm text-gray-500">
            {t('dashboard.cards.skills.yours', { count: mySkills ?? '—' })}
          </div>
          <button onClick={() => onGoTo('skills')} className="mt-5 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
            {t('dashboard.cards.skills.cta')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{t('dashboard.cards.profile.title')}</h3>
          </div>
          <p className="mt-3 text-gray-600">{t('dashboard.cards.profile.desc')}</p>
          <button onClick={() => onGoTo('profile')} className="mt-5 inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700">
            {t('dashboard.cards.profile.cta')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-float">
                {/* Estadísticas animadas */}
                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
                    <div className="text-3xl font-extrabold mb-2">{totalSkills ?? '—'}</div>
                    <div className="text-blue-100 text-lg">Skills totales</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
                    <div className="text-3xl font-extrabold mb-2">{mySkills ?? '—'}</div>
                    <div className="text-blue-100 text-lg">Tus skills</div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
                    <div className="text-3xl font-extrabold mb-2">100%</div>
                    <div className="text-blue-100 text-lg">Satisfacción</div>
                  </div>
                  <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 rounded-2xl p-6 text-white shadow-lg animate-fade-in">
                    <div className="text-3xl font-extrabold mb-2">∞</div>
                    <div className="text-blue-100 text-lg">Conexiones</div>
                  </div>
                </div>
                {/* Recursos tech extra */}
                <div className="mt-16 flex flex-wrap gap-8 justify-center items-center animate-fade-in">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" alt="React" className="h-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Django_logo.svg" alt="Django" className="h-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" alt="JS" className="h-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg" alt="Git" className="h-10" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/HTML5_Badge.svg" alt="HTML5" className="h-10" />
                </div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <MessageCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{t('dashboard.cards.chat.title')}</h3>
          </div>
          <p className="mt-3 text-gray-600">{t('dashboard.cards.chat.desc')}</p>
          <button onClick={() => onGoTo('chat')} className="mt-5 inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700">
            {t('dashboard.cards.chat.cta')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
