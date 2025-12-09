import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
  onToggleView: () => void;
  onBack?: () => void;
}
import { useI18n } from '../../contexts/I18nContext';
import { friendlyAuthError } from '../../lib/authErrors';

export function Login({ onToggleView, onBack }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(friendlyAuthError(error, t));
      }
    } catch (e: any) {
      setError(friendlyAuthError(e?.message || e, t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-4 py-12">
      <div className="max-w-md w-full">
        <button
          onClick={() => onBack ? onBack() : navigate('/')}
          className="mb-6 flex items-center gap-2 text-cyan-300 hover:text-cyan-100 font-mono text-base transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
        <div className="bg-gray-950 rounded-2xl shadow-2xl p-8 border-2 border-cyan-400">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-500 p-4 rounded-2xl shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-cyan-200 mb-2 font-mono">
            {t('auth.login.title')}
          </h2>
          <p className="text-center text-cyan-400 mb-8 font-mono">&nbsp;</p>
          {error && (
            <div className="bg-red-900 border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold">{t('auth.login.title')}</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>
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
                t('auth.login.submit')
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-cyan-300 font-mono">
              {t('auth.needAccount')} {' '}
              <button
                onClick={onToggleView}
                className="text-cyan-400 font-bold hover:text-purple-400 transition-colors font-mono"
              >
                {t('auth.signUp')}
              </button>
            </p>
          </div>
        </div>
        <p className="text-center text-sm text-cyan-400 mt-6 font-mono">
          Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad
        </p>
      </div>
    </div>
  );
}
