import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Lang = 'es' | 'en';

type I18nContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18N_STORAGE_KEY = 'skillconnect:lang';

const translations: Record<Lang, Record<string, string>> = {
  es: {
    'app.name': 'SkillConnect',
    'nav.skills': 'Habilidades',
    'nav.profile': 'Perfil',
    'nav.messages': 'Mensajes',
    'nav.signOut': 'Cerrar sesión',
    'nav.tutorial': 'Ver tutorial',
    'nav.language': 'Idioma',

    // Landing
    'landing.badge': 'Conecta, Aprende, Crece',
    'landing.title.1': 'Intercambia',
    'landing.title.2': 'Habilidades',
    'landing.title.3': 'con la Comunidad',
    'landing.subtitle': 'Únete a la plataforma donde personas comparten conocimientos, desarrollan nuevas habilidades y construyen conexiones significativas.',
    'landing.primaryCta': 'Comenzar Gratis',
    'landing.perk.free': '100% Gratis',
    'landing.perk.cardless': 'Sin tarjeta requerida',
    'landing.perk.community': 'Comunidad activa',
    'landing.why': '¿Por qué elegir SkillConnect?',
    'landing.why.subtitle': 'La plataforma más innovadora para el intercambio de conocimientos',
    'landing.feature.global.title': 'Sin fronteras',
    'landing.feature.global.desc': 'Conecta globalmente y comparte intereses para enseñar y aprender.',
    'landing.feature.chat.title': 'Chat en Tiempo Real',
    'landing.feature.chat.desc': 'Coordina sesiones y construye relaciones duraderas.',
    'landing.feature.growth.title': 'Crecimiento continuo',
    'landing.feature.growth.desc': 'Rastrea tu progreso y alcanza tus metas con una plataforma intuitiva.',
    'landing.stats.global': 'Global',
    'landing.stats.free': 'Gratis para siempre',
    'landing.stats.unrestricted': 'Sin restricciones',
    'landing.stats.satisfaction': 'Satisfacción',
    'landing.cta.title': '¿Listo para transformar tu aprendizaje?',
    'landing.cta.subtitle': 'Únete hoy y descubre un mundo de posibilidades',
    'landing.cta.button': 'Crear Cuenta Gratuita',

    // Auth
    'auth.login.title': 'Iniciar sesión',
    'auth.register.title': 'Únete a SkillConnect',
    'auth.email': 'Correo electrónico',
  'auth.email.placeholder': 'tu@email.com',
    'auth.password': 'Contraseña',
    'auth.username': 'Nombre de usuario',
    'auth.login.submit': 'Entrar',
    'auth.register.submit': 'Crear Cuenta Gratis',
  'auth.loading': 'Cargando... ',
    'auth.haveAccount': '¿Ya tienes cuenta?',
    'auth.needAccount': '¿Aún no tienes cuenta?',
    'auth.signIn': 'Inicia sesión',
    'auth.signUp': 'Regístrate',

    // Tutorial
    'tour.step1.title': 'Bienvenido/a a SkillConnect',
    'tour.step1.desc': 'Comparte y aprende habilidades con personas de todo el mundo.',
    'tour.step2.title': 'Explora habilidades',
    'tour.step2.desc': 'Descubre ofertas y solicita ayuda o intercambio.',
    'tour.step3.title': 'Chatea en tiempo real',
    'tour.step3.desc': 'Coordina sesiones y mantén conversaciones seguras.',
    'tour.step4.title': 'Completa tu perfil',
    'tour.step4.desc': 'Cuéntale a la comunidad quién eres y qué te apasiona.',
    'tour.next': 'Siguiente',
    'tour.back': 'Atrás',
    'tour.skip': 'Saltar',
    'tour.finish': '¡Empezar!'
  },
  en: {
    'app.name': 'SkillConnect',
    'nav.skills': 'Skills',
    'nav.profile': 'Profile',
    'nav.messages': 'Messages',
    'nav.signOut': 'Sign Out',
    'nav.tutorial': 'Show tutorial',
    'nav.language': 'Language',

    // Landing
    'landing.badge': 'Connect, Learn, Grow',
    'landing.title.1': 'Exchange',
    'landing.title.2': 'Skills',
    'landing.title.3': 'with the Community',
    'landing.subtitle': 'Join the platform where people share knowledge, develop new skills, and build meaningful connections.',
    'landing.primaryCta': 'Get Started Free',
    'landing.perk.free': '100% Free',
    'landing.perk.cardless': 'No credit card required',
    'landing.perk.community': 'Active community',
    'landing.why': 'Why choose SkillConnect?',
    'landing.why.subtitle': 'The most innovative platform for knowledge exchange',
    'landing.feature.global.title': 'Borderless',
    'landing.feature.global.desc': 'Connect globally and share interests to teach and learn.',
    'landing.feature.chat.title': 'Real-time chat',
    'landing.feature.chat.desc': 'Coordinate sessions and build lasting relationships.',
    'landing.feature.growth.title': 'Continuous growth',
    'landing.feature.growth.desc': 'Track your progress and reach your goals with an intuitive platform.',
    'landing.stats.global': 'Global',
    'landing.stats.free': 'Free forever',
    'landing.stats.unrestricted': 'Unrestricted',
    'landing.stats.satisfaction': 'Satisfaction',
    'landing.cta.title': 'Ready to transform your learning?',
    'landing.cta.subtitle': 'Join today and discover a world of possibilities',
    'landing.cta.button': 'Create Free Account',

    // Auth
    'auth.login.title': 'Sign in',
    'auth.register.title': 'Join SkillConnect',
    'auth.email': 'Email',
  'auth.email.placeholder': 'email@example.com',
    'auth.password': 'Password',
    'auth.username': 'Username',
    'auth.login.submit': 'Sign in',
    'auth.register.submit': 'Create Free Account',
  'auth.loading': 'Loading... ',
    'auth.haveAccount': 'Already have an account?',
    'auth.needAccount': "Don't have an account yet?",
    'auth.signIn': 'Sign in',
    'auth.signUp': 'Sign up',

    // Tutorial
    'tour.step1.title': 'Welcome to SkillConnect',
    'tour.step1.desc': 'Share and learn skills with people around the world.',
    'tour.step2.title': 'Explore skills',
    'tour.step2.desc': 'Discover offerings and request help or exchanges.',
    'tour.step3.title': 'Chat in real-time',
    'tour.step3.desc': 'Coordinate sessions and keep secure conversations.',
    'tour.step4.title': 'Complete your profile',
    'tour.step4.desc': 'Tell the community who you are and what you love.',
    'tour.next': 'Next',
    'tour.back': 'Back',
    'tour.skip': 'Skip',
    'tour.finish': "Let's start!"
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('es');

  useEffect(() => {
    const stored = localStorage.getItem(I18N_STORAGE_KEY) as Lang | null;
    if (stored === 'es' || stored === 'en') setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(I18N_STORAGE_KEY, l);
  };

  const toggleLang = () => setLang(lang === 'es' ? 'en' : 'es');

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const dict = translations[lang] ?? translations.es;
      let value = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replace(new RegExp(`{${k}}`, 'g'), String(v));
        }
      }
      return value;
    };
  }, [lang]);

  const value: I18nContextType = { lang, setLang, toggleLang, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
