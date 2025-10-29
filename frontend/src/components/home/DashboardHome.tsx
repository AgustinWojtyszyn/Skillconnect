import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { ArrowRight, MessageCircle, User, Layers, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardHomeProps {
  onGoTo: (view: 'skills' | 'profile' | 'chat') => void;
}

export function DashboardHome({ onGoTo }: DashboardHomeProps) {
  const { user } = useAuth();
  const { t } = useI18n();
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

  return (
    <div className="">
      {/* Encabezado con gradiente */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm/relaxed text-blue-100">{t('dashboard.welcomeBadge')}</p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-extrabold">
              {t('dashboard.welcome', { name: displayName })}
            </h1>
            <p className="mt-2 text-blue-100 max-w-2xl">
              {t('dashboard.subtitle')}
            </p>
          </div>
          <Sparkles className="w-10 h-10 hidden sm:block text-white/80" />
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

      {/* Tarjetas */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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
