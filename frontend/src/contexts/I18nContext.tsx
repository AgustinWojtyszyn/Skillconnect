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
  'nav.home': 'Inicio',
    'nav.profile': 'Perfil',
    'nav.messages': 'Mensajes',
    'nav.signOut': 'Cerrar sesión',
    'nav.tutorial': 'Ver tutorial',
    'nav.language': 'Idioma',
  // Dashboard
  'dashboard.welcomeBadge': 'Panel de inicio',
  'dashboard.welcome': '¡Hola, {name}!',
  'dashboard.subtitle': 'Organiza tus próximos pasos: completa tu perfil, explora habilidades y retoma tus conversaciones.',
  'dashboard.actions.exploreSkills': 'Explorar habilidades',
  'dashboard.actions.completeProfile': 'Completar perfil',
  'dashboard.actions.openMessages': 'Abrir mensajes',
  'dashboard.cards.skills.title': 'Habilidades en la comunidad',
  'dashboard.cards.skills.desc': 'Descubre lo que otros están ofreciendo o buscando aprender.',
  'dashboard.cards.skills.total': 'totales',
  'dashboard.cards.skills.yours': '{count} tuyas',
  'dashboard.cards.skills.cta': 'Ver habilidades',
  'dashboard.cards.profile.title': 'Tu perfil',
  'dashboard.cards.profile.desc': 'Un perfil completo aumenta tus chances de conectar.',
  'dashboard.cards.profile.cta': 'Ir a mi perfil',
    'dashboard.cards.chat.title': 'Mensajes',
    'dashboard.cards.chat.desc': 'Retoma tus conversaciones o inicia nuevas conexiones.',
    'dashboard.cards.chat.cta': 'Ir al chat',

    // Profile
    'profile.editProfile': 'Editar perfil',
    'profile.cancel': 'Cancelar',
    'profile.saveChanges': 'Guardar cambios',
    'profile.changeAvatar': 'Cambiar avatar',
    'profile.changeBanner': 'Cambiar banner',
    'profile.uploadError': 'No se pudo subir la imagen. Inténtalo más tarde.',
    'profile.fullName': 'Nombre completo',
    'profile.fullName.placeholder': 'Ingresa tu nombre completo',
    'profile.bio': 'Biografía',
    'profile.bio.placeholder': 'Cuéntanos sobre ti',
    'profile.location': 'Ubicación',
    'profile.location.placeholder': 'Ciudad, País',
    'profile.mySkills': 'Mis habilidades',
    'profile.addSkill': 'Agregar habilidad',
    'profile.noSkills': '¡Aún no agregaste habilidades! Agrega tu primera habilidad.',
    'profile.skill.title': 'Título',
    'profile.skill.title.placeholder': 'Ej: Desarrollo web',
    'profile.skill.category': 'Categoría',
    'profile.skill.description': 'Descripción',
    'profile.skill.description.placeholder': 'Describe tu habilidad',
    'profile.skill.level': 'Nivel',
    'profile.skill.type': 'Tipo',
    'profile.skill.update': 'Actualizar',
    'profile.skill.add': 'Agregar',
    'profile.skill.offering': 'Ofrezco',
    'profile.skill.seeking': 'Busco',
    'profile.level.beginner': 'Principiante',
    'profile.level.intermediate': 'Intermedio',
    'profile.level.expert': 'Experto',
    'profile.category.programming': 'Programación',
    'profile.category.design': 'Diseño',
    'profile.category.marketing': 'Marketing',
    'profile.category.writing': 'Escritura',
    'profile.category.business': 'Negocios',
    'profile.category.music': 'Música',
    'profile.category.languages': 'Idiomas',
    'profile.category.other': 'Otro',

    // Skills List
    'skills.title': 'Explorar habilidades',
    'skills.filterType': 'Tipo',
    'skills.filterCategory': 'Categoría',
    'skills.all': 'Todas',
    'skills.offering': 'Ofrecen',
    'skills.seeking': 'Buscan',
    'skills.noResults': 'No se encontraron habilidades con esos filtros',
    'skills.startChat': 'Iniciar chat',
    'skills.search.placeholder': 'Buscar habilidades...',
    'skills.filter.allCategories': 'Todas las categorías',
    'skills.filter.allTypes': 'Todos los tipos',
    'skills.chat': 'Chat',
    'skills.visibility': 'Visibilidad',
    'skills.visibility.public': 'Público',
    'skills.visibility.friends': 'Solo amigos',

    // People
    'people.title': 'Personas',
    'people.search.placeholder': 'Buscar personas...',
  'people.search.button': 'Buscar',
  'people.filter.label': 'Filtro',
    'people.filter.all': 'Todos',
    'people.filter.following': 'Siguiendo',
    'people.follow': 'Seguir',
    'people.unfollow': 'Siguiendo',
    'people.noResults': 'No se encontraron personas',
  'people.requests.addFriend': 'Agregar amigo',
  'people.requests.sent': 'Solicitud enviada',
  'people.requests.accept': 'Aceptar',
  'people.requests.reject': 'Rechazar',
  'people.requests.friends': 'Amigos',
  'people.requests.viewProfile': 'Ver perfil',
  'people.suggest.title': 'Usuarios recientes',
  'people.suggest.offering': 'Ofrece',
  'people.suggest.seeking': 'Busca',
    
    // Nav
    'nav.people': 'Personas',

    // Chat
    'chat.title': 'Mensajes',
    'chat.newConversation': 'Nueva conversación',
    'chat.noConversations': 'No tienes conversaciones aún',
    'chat.selectConversation': 'Selecciona una conversación para comenzar',
    'chat.typePlaceholder': 'Escribe un mensaje...',
    'chat.send': 'Enviar',
    'chat.back': 'Volver',

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

    // Auth - mensajes de error/éxito
    'auth.errors.generic': 'Ocurrió un error. Intenta de nuevo más tarde.',
    'auth.errors.invalid_credentials': 'Correo o contraseña incorrectos.',
    'auth.errors.email_not_confirmed': 'Debes confirmar tu correo antes de iniciar sesión.',
    'auth.errors.email_already_registered': 'Este correo ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.',
    'auth.errors.rate_limited': 'Demasiados intentos. Por seguridad, inténtalo más tarde.',
    'auth.errors.network': 'No se pudo conectar. Verifica tu conexión a internet.',
    'auth.errors.password_too_short': 'La contraseña debe tener al menos {min} caracteres.',
    'auth.success.check_email_confirmation': '¡Cuenta creada! Revisa tu correo para confirmar tu email y poder iniciar sesión.',

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
  'nav.home': 'Home',
    'nav.profile': 'Profile',
    'nav.messages': 'Messages',
    'nav.signOut': 'Sign Out',
    'nav.tutorial': 'Show tutorial',
    'nav.language': 'Language',
  // Dashboard
  'dashboard.welcomeBadge': 'Dashboard',
  'dashboard.welcome': 'Hi, {name}!',
  'dashboard.subtitle': 'Plan your next steps: complete your profile, explore skills, and catch up on messages.',
  'dashboard.actions.exploreSkills': 'Explore skills',
  'dashboard.actions.completeProfile': 'Complete profile',
  'dashboard.actions.openMessages': 'Open messages',
  'dashboard.cards.skills.title': 'Skills in the community',
  'dashboard.cards.skills.desc': 'Discover what others are offering or looking to learn.',
  'dashboard.cards.skills.total': 'total',
  'dashboard.cards.skills.yours': '{count} yours',
  'dashboard.cards.skills.cta': 'View skills',
  'dashboard.cards.profile.title': 'Your profile',
  'dashboard.cards.profile.desc': 'A complete profile increases your chances to connect.',
  'dashboard.cards.profile.cta': 'Go to my profile',
    'dashboard.cards.chat.title': 'Messages',
    'dashboard.cards.chat.desc': 'Continue your conversations or start new ones.',
    'dashboard.cards.chat.cta': 'Go to chat',

    // Profile
    'profile.editProfile': 'Edit profile',
    'profile.cancel': 'Cancel',
    'profile.saveChanges': 'Save changes',
    'profile.changeAvatar': 'Change avatar',
    'profile.changeBanner': 'Change banner',
    'profile.uploadError': 'Failed to upload image. Please try again later.',
    'profile.fullName': 'Full name',
    'profile.fullName.placeholder': 'Enter your full name',
    'profile.bio': 'Bio',
    'profile.bio.placeholder': 'Tell us about yourself',
    'profile.location': 'Location',
    'profile.location.placeholder': 'City, Country',
    'profile.mySkills': 'My skills',
    'profile.addSkill': 'Add skill',
    'profile.noSkills': 'No skills added yet. Add your first skill!',
    'profile.skill.title': 'Title',
    'profile.skill.title.placeholder': 'e.g., Web development',
    'profile.skill.category': 'Category',
    'profile.skill.description': 'Description',
    'profile.skill.description.placeholder': 'Describe your skill',
    'profile.skill.level': 'Level',
    'profile.skill.type': 'Type',
    'profile.skill.update': 'Update',
    'profile.skill.add': 'Add',
    'profile.skill.offering': 'Offering',
    'profile.skill.seeking': 'Seeking',
    'profile.level.beginner': 'Beginner',
    'profile.level.intermediate': 'Intermediate',
    'profile.level.expert': 'Expert',
    'profile.category.programming': 'Programming',
    'profile.category.design': 'Design',
    'profile.category.marketing': 'Marketing',
    'profile.category.writing': 'Writing',
    'profile.category.business': 'Business',
    'profile.category.music': 'Music',
    'profile.category.languages': 'Languages',
    'profile.category.other': 'Other',

    // Skills List
    'skills.title': 'Explore skills',
    'skills.filterType': 'Type',
    'skills.filterCategory': 'Category',
    'skills.all': 'All',
    'skills.offering': 'Offering',
    'skills.seeking': 'Seeking',
    'skills.noResults': 'No skills found with those filters',
    'skills.startChat': 'Start chat',
    'skills.search.placeholder': 'Search skills...',
    'skills.filter.allCategories': 'All Categories',
    'skills.filter.allTypes': 'All Types',
    'skills.chat': 'Chat',
    'skills.visibility': 'Visibility',
    'skills.visibility.public': 'Public',
    'skills.visibility.friends': 'Friends only',

    // People
    'people.title': 'People',
    'people.search.placeholder': 'Search people...',
  'people.search.button': 'Search',
  'people.filter.label': 'Filter',
    'people.filter.all': 'All',
    'people.filter.following': 'Following',
    'people.follow': 'Follow',
    'people.unfollow': 'Following',
    'people.noResults': 'No people found',
  'people.requests.addFriend': 'Add friend',
  'people.requests.sent': 'Request sent',
  'people.requests.accept': 'Accept',
  'people.requests.reject': 'Reject',
  'people.requests.friends': 'Friends',
  'people.requests.viewProfile': 'View profile',
  'people.suggest.title': 'New users',
  'people.suggest.offering': 'Offering',
  'people.suggest.seeking': 'Seeking',
    
    // Nav
    'nav.people': 'People',

    // Chat
    'chat.title': 'Messages',
    'chat.newConversation': 'New conversation',
    'chat.noConversations': 'You have no conversations yet',
    'chat.selectConversation': 'Select a conversation to start',
    'chat.typePlaceholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.back': 'Back',

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

    // Auth - error/success messages
    'auth.errors.generic': 'Something went wrong. Please try again later.',
    'auth.errors.invalid_credentials': 'Incorrect email or password.',
    'auth.errors.email_not_confirmed': 'Please confirm your email before signing in.',
    'auth.errors.email_already_registered': 'This email is already registered. Try signing in or resetting your password.',
    'auth.errors.rate_limited': 'Too many attempts. For security, please try again later.',
    'auth.errors.network': 'Could not connect. Check your internet connection.',
    'auth.errors.password_too_short': 'Password must be at least {min} characters long.',
    'auth.success.check_email_confirmation': 'Account created! Check your inbox to confirm your email before signing in.',

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
