import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { AuthGuard } from './components/auth/AuthGuard';
import { Header } from './components/layout/Header';
import { SkillsList } from './components/skills/SkillsList';
import { Profile } from './components/profile/Profile';
import { Chat } from './components/chat/Chat';

function MainApp() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState<'skills' | 'profile' | 'chat'>('skills');
  const [chatUserId, setChatUserId] = useState<string | undefined>();
  const [chatUsername, setChatUsername] = useState<string | undefined>();

  const handleStartChat = (userId: string, username: string) => {
    setChatUserId(userId);
    setChatUsername(username);
    setCurrentView('chat');
  };

  if (!user) {
    return showLogin ? (
      <Login onToggleView={() => setShowLogin(false)} />
    ) : (
      <Register onToggleView={() => setShowLogin(true)} />
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'skills' && <SkillsList onStartChat={handleStartChat} />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'chat' && (
            <Chat initialUserId={chatUserId} initialUsername={chatUsername} />
          )}
        </main>
      </div>
    </AuthGuard>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
