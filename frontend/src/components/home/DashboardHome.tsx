import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

interface DashboardHomeProps {
  onGoTo: (view: 'skills' | 'profile' | 'chat') => void;
}

export function DashboardHome({ onGoTo }: DashboardHomeProps) {
  const { user } = useAuth();
  const { t, lang, setLang } = useI18n();
  const { bannerColor } = useTheme();

  const displayName = useMemo(
    () =>
      (user?.user_metadata?.username as string) ||
      (user?.email as string) ||
      'Usuario',
    [user]
  );

  const toggleLang = () => setLang(lang === 'es' ? 'en' : 'es');

  const [totalSkills, setTotalSkills] = useState<number | null>(null);
  const [mySkills, setMySkills] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      try {
        const total = await supabase
          .from('skills')
          .select('id', { count: 'exact', head: true });

        const mine = user
          ? await supabase
              .from('skills')
              .select('id', { count: 'exact', head: true })
              .eq('user_id', user.id)
          : { count: null };

        if (!cancelled) {
          setTotalSkills(total.count ?? null);
          setMySkills(mine.count ?? null);
        }
      } catch {
        // Silenciar errores
      }
    }

    loadCounts();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="relative font-sans min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      {/* Botón idioma */}
      <button
        onClick={toggleLang}
        className="absolute top-6 right-6 z-20 bg-gray-900 border border-cyan-400 text-cyan-200 px-4 py-2 rounded-lg font-mono text-sm shadow hover:bg-cyan-900 transition"
        aria-label="Cambiar idioma"
      >
        {lang === 'es' ? 'EN' : 'ES'}
      </button>

      {/* Fondo decorativo */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{ zIndex: 0, opacity: 0.15 }}
      >
        <img
          src="/assets/tech-bg.svg"
          alt="Tech background"
          className="w-full h-64 object-cover"
        />
      </div>

      <section className="relative z-10 max-w-6xl mx-auto pt-16 pb-8 px-4">
        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mb-4">
            {t('dashboard.welcome', { name: displayName })}
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 max-w-3xl font-light">
            {t('dashboard.subtitle')}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* SKILLS */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 6v6l4 2" />
                </svg>
                <h3 className="text-xl font-bold text-cyan-300 font-mono">
                  {t('dashboard.cards.skills.title')}
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                {t('dashboard.cards.skills.desc')}
              </p>

              <div className="text-3xl font-extrabold text-cyan-200 font-mono">
                {totalSkills ?? '—'}
              </div>

              <div className="text-sm text-cyan-400 mb-6">
                {t('dashboard.cards.skills.total')}
              </div>
            </div>

            <button
              onClick={() => onGoTo('skills')}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold px-4 py-3 rounded-xl shadow-lg transition"
            >
              {t('dashboard.cards.skills.cta')}
            </button>
          </div>

          {/* PROFILE */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                </svg>
                <h3 className="text-xl font-bold text-purple-300 font-mono">
                  {t('dashboard.cards.profile.title')}
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                {t('dashboard.cards.profile.desc')}
              </p>

              <div className="text-3xl font-extrabold text-purple-200 font-mono">
                {mySkills ?? '—'}
              </div>
            </div>

            <button
              onClick={() => onGoTo('profile')}
              className="w-full bg-purple-500 hover:bg-purple-400 text-gray-900 font-bold px-4 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="7" r="4" />
                <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
              </svg>
              Ir a mi perfil
            </button>
          </div>

          {/* CHAT */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3 className="text-xl font-bold text-blue-300 font-mono">
                  {t('dashboard.cards.chat.title')}
                </h3>
              </div>

              <p className="text-gray-300 mb-4">
                {t('dashboard.cards.chat.desc')}
              </p>

              <div className="text-3xl font-extrabold text-blue-200 font-mono">
                ∞
              </div>
            </div>

            <button
              onClick={() => onGoTo('chat')}
              className="w-full bg-blue-500 hover:bg-blue-400 text-gray-900 font-bold px-4 py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Ir al chat
            </button>
          </div>
        </section>
      </section>
    </div>
  );
}
