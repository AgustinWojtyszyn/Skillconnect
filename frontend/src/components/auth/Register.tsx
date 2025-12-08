import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import { friendlyAuthError } from '../../lib/authErrors';
import { UserPlus, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
  onToggleView: () => void;
  onBack?: () => void;
}

export function Register({ onToggleView, onBack }: RegisterProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (password.length < 6) {
      setError(t('auth.errors.password_too_short', { min: 6 }));
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, username);
      if (error) {
        setError(friendlyAuthError(error, t));
      } else {
        // Éxito: si la confirmación de email está habilitada, no habrá sesión inmediata
        setSuccess(t('auth.success.check_email_confirmation'));
      }
    } catch (e: any) {
      // Si falla la llamada (por ejemplo, cliente no configurado), evitamos dejar el loading infinito
      setError(friendlyAuthError(e?.message || e, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-12">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-100 font-mono text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-gray-950 rounded-2xl shadow-2xl p-8 border-2 border-cyan-400">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-4 rounded-2xl shadow-lg">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-cyan-200 mb-2 font-mono">
            {t('auth.register.title')}
          </h2>
          <p className="text-center text-cyan-400 mb-8 font-mono">
            {t('landing.cta.subtitle')}
          </p>
          {error && (
            <div className="bg-red-900 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900 border-l-4 border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-cyan-300 mb-2 font-mono">
                {t('auth.username')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-cyan-400 bg-gray-900 text-cyan-100 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono transition-all"
                  placeholder="juanperez"
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-cyan-300 mb-2 font-mono">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-cyan-400 bg-gray-900 text-cyan-100 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono transition-all"
                  placeholder={t('auth.email.placeholder')}
                  disabled={loading}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-cyan-300 mb-2 font-mono">
                {t('auth.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-cyan-400 bg-gray-900 text-cyan-100 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-sm text-cyan-400 font-mono">Mínimo 6 caracteres</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-500 text-gray-900 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-mono"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  {t('auth.loading')}
                </span>
              ) : (
                t('auth.register.submit')
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-cyan-300 font-mono">
              {t('auth.haveAccount')} {' '}
              <button
                onClick={onToggleView}
                className="text-cyan-400 font-bold hover:text-purple-400 transition-colors font-mono"
              >
                {t('auth.signIn')}
              </button>
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-cyan-400 mt-6 font-mono">
          Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}
