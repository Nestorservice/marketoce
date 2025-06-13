
import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Calendar, Bot, ShoppingCart, MapPin, ArrowRight, Utensils, Heart, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const Home: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Calendar,
      title: t('home.features.planning'),
      description: 'Planifiez vos repas pour la semaine avec des suggestions intelligentes'
    },
    {
      icon: Bot,
      title: t('home.features.ai'),
      description: 'Assistant IA nutritionniste pour des conseils personnalisés'
    },
    {
      icon: ShoppingCart,
      title: t('home.features.shopping'),
      description: 'Génération automatique de listes de courses optimisées'
    },
    {
      icon: MapPin,
      title: t('home.features.markets'),
      description: 'Trouvez les marchés les plus proches de votre position'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-orange-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <ChefHat className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center px-4 py-2 text-green-700 hover:text-green-800 font-medium transition-colors"
              >
                {t('auth.login')}
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6">
              <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            
            <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
              {t('home.description')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/register"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group"
              >
                <span className="text-lg">{t('home.cta')}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                <span>{t('auth.login')}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Une solution complète pour simplifier votre quotidien culinaire
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-up border border-gray-100"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <Utensils className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Recettes disponibles</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center justify-center mb-4">
                <Users className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-lg opacity-90">Utilisateurs actifs</div>
            </div>
            
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center justify-center mb-4">
                <Heart className="w-12 h-12" />
              </div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg opacity-90">Satisfaction client</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Prêt à transformer votre façon de cuisiner ?
          </h2>
          
          <p className="text-xl text-gray-600 mb-10">
            Rejoignez des milliers d'utilisateurs qui planifient déjà leurs repas intelligemment
          </p>
          
          <Link
            to="/register"
            className="inline-flex items-center space-x-3 px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group text-lg"
          >
            <span>Commencer gratuitement</span>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">{t('home.title')}</span>
          </div>
          
          <p className="text-gray-400 mb-6">
            Simplifiez votre quotidien culinaire avec l'intelligence artificielle
          </p>
          
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm">
              © 2024 SmartMeal Planner. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
