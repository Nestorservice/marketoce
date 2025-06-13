import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChefHat, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Tentative de connexion avec email :', email);

      // Vérification spéciale pour admin
      if (email === 'admin@demo.com' && password === 'password') {
        toast.success('Connexion admin réussie !');
        console.log('Admin identifié. Redirection vers /admin...');
        setTimeout(() => {
          navigate('/admin', { replace: true });
        }, 100);
        return;
      }

      // Connexion normale
      await login(email, password);
      toast.success('Connexion réussie !');
      console.log('Utilisateur connecté. Redirection vers /setup...');
      setTimeout(() => {
        navigate('/setup', { replace: true });
      }, 100);
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      toast.error(t('auth.loginError') || 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
      setEmail('');
      setPassword('');
      setLoading(false);
    }
  };

  // Fallback navigation si utilisateur connecté mais échec redirection
  useEffect(() => {
    if (user && !loading && window.location.pathname !== '/setup') {
      const timer = setTimeout(() => {
        if (window.location.pathname !== '/setup') {
          window.location.href = '/setup';
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="absolute top-6 right-6">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              SmartMeal
            </span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-gray-600">
            Bienvenue de retour ! Connectez-vous à votre compte.
          </p>
        </div>

        {/* Demo credentials */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">🧪 Comptes de démonstration :</h3>
          <div className="text-xs text-blue-700 space-y-1">
            <div><strong>Client :</strong> client@demo.com / password</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>{t('auth.login')}</span>
              </>
            )}
          </button>

          <div className="text-center">
            <span className="text-gray-600">{t('auth.noAccount')} </span>
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              {t('auth.register')}
            </Link>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
