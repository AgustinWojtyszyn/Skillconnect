import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthGuard } from './components/auth/AuthGuard';
import { Header } from './components/layout/Header';
import { SkillsList } from './components/skills/SkillsList';
import { Profile } from './components/profile/Profile';
import { Chat } from './components/chat/Chat';
import { LandingPage } from './components/landing/LandingPage';
import { OnboardingTour } from './components/onboarding/OnboardingTour';
import { DashboardHome } from './components/home/DashboardHome';
import { PeoplePage } from './components/people/PeoplePage';
import { UserProfile } from './components/people/UserProfile';

function MainApp() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'skills' | 'profile' | 'chat' | 'people' | 'user'>('home');
  const [chatUserId, setChatUserId] = useState<string | undefined>();
  const [chatUsername, setChatUsername] = useState<string | undefined>();
  const [viewedUserId, setViewedUserId] = useState<string | undefined>();
  const [showTour, setShowTour] = useState(false);
  // Asegurar que tras un login siempre caemos en 'home'
  useEffect(() => {
    if (user) {
      setCurrentView('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleStartChat = (userId: string, username: string) => {
    // Limpiar el userId anterior para forzar re-render en Chat
    setChatUserId(undefined);
    setChatUsername(undefined);
    // Usar setTimeout para asegurar que el efecto en Chat detecte el cambio
    setTimeout(() => {
      setChatUserId(userId);
      setChatUsername(username);
      setCurrentView('chat');
    }, 0);
  };

  const handleGetStarted = () => {
    setShowLanding(false);
    setShowLogin(false); // Mostrar registro por defecto
  };
  const openUserProfile = (userId: string) => {
    setViewedUserId(userId);
    setCurrentView('user');
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  // Mostrar tutorial al primer login
  if (user && !showTour) {
    const seen = localStorage.getItem(`skillconnect:tutorialSeen:${user.id}`);
    if (seen !== 'true') {
      setShowTour(true);
    }
  }

  // Si no hay usuario y está en landing, mostrar landing
  if (!user && showLanding) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Si no hay usuario, mostrar login o registro
  if (!user) {
    return showLogin ? (
      <Login onToggleView={() => setShowLogin(false)} onBack={handleBackToLanding} />
    ) : (
      <Register onToggleView={() => setShowLogin(true)} onBack={handleBackToLanding} />
    );
  }

  // Usuario autenticado, mostrar dashboard
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header
          currentView={currentView === 'user' ? 'people' : currentView}
          onViewChange={setCurrentView}
          onShowTutorial={() => setShowTour(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'home' && (
            <DashboardHome
              onGoTo={(v) => {
                setCurrentView(v);
              }}
            />
          )}
          {currentView === 'skills' && <SkillsList onStartChat={handleStartChat} />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'people' && (
            <PeoplePage
              onViewProfile={openUserProfile}
              onStartChat={handleStartChat}
            />
          )}
          {currentView === 'chat' && (
            <Chat initialUserId={chatUserId} />
          )}
          {currentView === 'user' && viewedUserId && (
            <UserProfile
              userId={viewedUserId}
              onBack={() => setCurrentView('people')}
              onStartChat={handleStartChat}
              onOpenUser={(id: string) => openUserProfile(id)}
            />
          )}
        </main>
        <OnboardingTour
          open={showTour}
          onClose={() => {
            setShowTour(false);
            if (user) localStorage.setItem(`skillconnect:tutorialSeen:${user.id}`, 'true');
          }}
        />
      </div>
    </AuthGuard>
  );
}

function App() {
  // Si faltan variables de entorno para Supabase, mostramos una pantalla de configuración en lugar de romper.
  const hasSupabaseEnv = Boolean(
    (import.meta as any).env?.VITE_SUPABASE_URL && (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  );

  if (!hasSupabaseEnv) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Configuración requerida</h1>
          <p className="text-gray-700">
            Faltan variables de entorno para conectarse a Supabase. Define las siguientes variables en tu
            servicio de Render y vuelve a desplegar:
          </p>
          <ul className="list-disc list-inside text-gray-800">
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code>
            </li>
            <li>
              <code className="bg-gray-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code>
            </li>
          </ul>
          <p className="text-sm text-gray-500">
            Consejo: En servicios Docker de Render, las variables de entorno están disponibles durante el build, por lo que
            Vite las inyectará en el bundle. Luego, redepliega para aplicar los cambios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <I18nProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;
