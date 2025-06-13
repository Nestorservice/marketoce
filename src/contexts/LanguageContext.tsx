
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.myPlates': 'Mes Plats',
    'nav.planning': 'Programmation',
    'nav.shopping': 'Liste de Courses',
    'nav.assistant': 'Assistant IA',
    'nav.markets': 'Marchés',
    'nav.logout': 'Déconnexion',
    
    // Home page
    'home.title': 'SmartMeal Planner',
    'home.subtitle': 'Planifiez vos repas intelligemment avec l\'IA',
    'home.description': 'Gérez vos repas, générez vos listes de courses et découvrez de nouvelles recettes avec notre assistant IA nutritionniste.',
    'home.features.planning': 'Planning Intelligent',
    'home.features.ai': 'Assistant IA',
    'home.features.shopping': 'Listes de Courses',
    'home.features.markets': 'Marchés Proches',
    'home.cta': 'Commencer Maintenant',
    
    // Auth
    'auth.login': 'Se Connecter',
    'auth.register': "S'Inscrire",
    'auth.email': 'Email',
    'auth.password': 'Mot de passe',
    'auth.firstName': 'Prénom',
    'auth.lastName': 'Nom',
    'auth.confirmPassword': 'Confirmer le mot de passe',
    'auth.loginTitle': 'Connexion à SmartMeal',
    'auth.registerTitle': 'Créer un compte',
    'auth.noAccount': 'Pas de compte ?',
    'auth.hasAccount': 'Déjà un compte ?',
    
    // Dashboard
    'dashboard.welcome': 'Bienvenue',
    'dashboard.weekMenu': 'Menu de la Semaine',
    'dashboard.quickActions': 'Actions Rapides',
    'dashboard.addPlate': 'Ajouter un Plat',
    'dashboard.generateList': 'Générer la Liste',
    'dashboard.askAI': 'Demander à l\'IA',
    'dashboard.findMarkets': 'Trouver des Marchés',
    
    // Setup
    'setup.title': 'Configuration de votre profil',
    'setup.people': 'Nombre de personnes',
    'setup.gender': 'Sexe',
    'setup.age': 'Âge',
    'setup.objective': 'Objectif alimentaire',
    'setup.complete': 'Terminer la configuration',
    'setup.objectives.standard': 'Standard',
    'setup.objectives.vegetarian': 'Végétarien',
    'setup.objectives.halal': 'Halal',
    'setup.objectives.gluten_free': 'Sans gluten',
    'setup.objectives.sport': 'Sportif',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.add': 'Ajouter',
    'common.search': 'Rechercher',
    'common.close': 'Fermer',
    'common.confirm': 'Confirmer',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.myPlates': 'My Dishes',
    'nav.planning': 'Planning',
    'nav.shopping': 'Shopping List',
    'nav.assistant': 'AI Assistant',
    'nav.markets': 'Markets',
    'nav.logout': 'Logout',
    
    // Home page
    'home.title': 'SmartMeal Planner',
    'home.subtitle': 'Plan your meals intelligently with AI',
    'home.description': 'Manage your meals, generate shopping lists and discover new recipes with our AI nutritionist assistant.',
    'home.features.planning': 'Smart Planning',
    'home.features.ai': 'AI Assistant',
    'home.features.shopping': 'Shopping Lists',
    'home.features.markets': 'Nearby Markets',
    'home.cta': 'Get Started Now',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.firstName': 'First Name',
    'auth.lastName': 'Last Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.loginTitle': 'Login to SmartMeal',
    'auth.registerTitle': 'Create Account',
    'auth.noAccount': 'No account?',
    'auth.hasAccount': 'Already have an account?',
    
    // Dashboard
    'dashboard.welcome': 'Welcome',
    'dashboard.weekMenu': 'Week Menu',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.addPlate': 'Add Dish',
    'dashboard.generateList': 'Generate List',
    'dashboard.askAI': 'Ask AI',
    'dashboard.findMarkets': 'Find Markets',
    
    // Setup
    'setup.title': 'Configure your profile',
    'setup.people': 'Number of people',
    'setup.gender': 'Gender',
    'setup.age': 'Age',
    'setup.objective': 'Dietary objective',
    'setup.complete': 'Complete setup',
    'setup.objectives.standard': 'Standard',
    'setup.objectives.vegetarian': 'Vegetarian',
    'setup.objectives.halal': 'Halal',
    'setup.objectives.gluten_free': 'Gluten-free',
    'setup.objectives.sport': 'Athletic',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.search': 'Search',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
  }
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('smartmeal_language') as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguage(savedLang);
    } else {
      // Détecter la langue du navigateur
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('en')) {
        setLanguage('en');
      }
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('smartmeal_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
