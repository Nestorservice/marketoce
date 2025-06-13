import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChefHat, 
  ShoppingCart, 
  Bot, 
  Plus, 
  TrendingUp,
  Clock,
  Users,
  Package, // Pour les articles totaux dans les listes de courses
  DollarSign, // Pour le budget estimé
  CheckCircle2 // Pour les articles terminés
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Layout from '../components/Layout';
import { Card, CardContent } from '../components/ui/card'; // Importé Card et CardContent
import { Badge } from '../components/ui/badge'; // Importé Badge

// Importe les fonctions Firebase depuis votre fichier de service
import { db, collection, onSnapshot } from '../services/firebase';

// Interfaces pour les données que nous allons récupérer
interface Dish {
  id: string;
  name: string;
  category: 'petit_dejeuner' | 'dejeuner' | 'diner';
  // Incluez d'autres champs de Dish si nécessaire, mais seulement ceux utilisés pour la logique
}

interface MealPlan {
  date: string;
  petit_dejeuner?: Dish;
  dejeuner?: Dish;
  diner?: Dish;
}

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  estimatedPrice: number;
  purchased: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  householdSize: number;
  estimatedBudget: number;
  items: ShoppingItem[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // États pour les données dynamiques
  const [totalDishes, setTotalDishes] = useState<number>(0);
  const [plannedMealsCount, setPlannedMealsCount] = useState<number>(0);
  const [totalHouseholdSize, setTotalHouseholdSize] = useState<number>(0);
  const [totalShoppingItems, setTotalShoppingItems] = useState<number>(0);
  const [totalPurchasedItems, setTotalPurchasedItems] = useState<number>(0);
  const [totalEstimatedBudget, setTotalEstimatedBudget] = useState<number>(0);
  const [currentWeekMenu, setCurrentWeekMenu] = useState<{ day: string; meal: string; type: 'lunch' | 'dinner' }[]>([]);

  // Récupérer la date du lundi de la semaine en cours
  const getMondayOfCurrentWeek = useCallback(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Dimanche = 0, Lundi = 1, ...
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuste pour que le lundi soit le premier jour
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0); // Réinitialise l'heure pour la comparaison de date
    return monday;
  }, []);

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // --- useEffect pour les Plats enregistrés (dishes) ---
  useEffect(() => {
    const dishesCollectionRef = collection(db, 'dishes');
    const unsubscribe = onSnapshot(dishesCollectionRef, (snapshot) => {
      setTotalDishes(snapshot.size); // Le nombre de documents dans la collection
    }, (error) => {
      console.error("Erreur lors du chargement du nombre de plats :", error);
    });
    return () => unsubscribe();
  }, []);

  // --- useEffect pour les Repas planifiés (mealPlans) et le menu de la semaine ---
  useEffect(() => {
    const mealPlansCollectionRef = collection(db, 'mealPlans');
    const monday = getMondayOfCurrentWeek();
    const weekDaysArray = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return { date: formatDate(day), display: day.toLocaleDateString('fr-FR', { weekday: 'long' }) };
    });

    const unsubscribe = onSnapshot(mealPlansCollectionRef, (snapshot) => {
      let count = 0;
      const fetchedWeekMenu: { day: string; meal: string; type: 'lunch' | 'dinner' }[] = [];
      const currentWeekPlans: { [date: string]: MealPlan } = {};

      snapshot.docs.forEach(doc => {
        const planDate = doc.id; // L'ID du document est la date YYYY-MM-DD
        const planData = doc.data() as MealPlan;

        // Filtrer uniquement les plans de la semaine en cours
        if (weekDaysArray.some(day => day.date === planDate)) {
          currentWeekPlans[planDate] = { ...planData, date: planDate };
          if (planData.petit_dejeuner) count++;
          if (planData.dejeuner) count++;
          if (planData.diner) count++;
        }
      });
      setPlannedMealsCount(count);

      // Préparer le menu de la semaine pour l'affichage
      weekDaysArray.forEach(day => {
        const plan = currentWeekPlans[day.date];
        if (plan) {
          if (plan.petit_dejeuner) {
            fetchedWeekMenu.push({ day: day.display, meal: plan.petit_dejeuner.name, type: 'lunch' });
          }
          if (plan.dejeuner) {
            fetchedWeekMenu.push({ day: day.display, meal: plan.dejeuner.name, type: 'lunch' });
          }
          if (plan.diner) {
            fetchedWeekMenu.push({ day: day.display, meal: plan.diner.name, type: 'dinner' });
          }
        }
      });
      setCurrentWeekMenu(fetchedWeekMenu);

    }, (error) => {
      console.error("Erreur lors du chargement des plans de repas :", error);
    });
    return () => unsubscribe();
  }, [getMondayOfCurrentWeek]); // Dépend de getMondayOfCurrentWeek pour se rafraîchir chaque semaine

  // --- useEffect pour les Listes de courses (shoppingLists) ---
  useEffect(() => {
    const shoppingListsCollectionRef = collection(db, 'shoppingLists');
    const unsubscribe = onSnapshot(shoppingListsCollectionRef, (snapshot) => {
      let householdSum = 0;
      let totalItems = 0;
      let purchasedItems = 0;
      let estimatedBudgetSum = 0;

      snapshot.docs.forEach(doc => {
        const listData = doc.data() as ShoppingList;
        householdSum += listData.householdSize || 0;
        estimatedBudgetSum += listData.estimatedBudget || 0;
        
        if (listData.items) {
          totalItems += listData.items.length;
          purchasedItems += listData.items.filter(item => item.purchased).length;
        }
      });
      setTotalHouseholdSize(householdSum);
      setTotalShoppingItems(totalItems);
      setTotalPurchasedItems(purchasedItems);
      setTotalEstimatedBudget(estimatedBudgetSum);

    }, (error) => {
      console.error("Erreur lors du chargement des listes de courses :", error);
    });
    return () => unsubscribe();
  }, []);

  const quickActions = [
    {
      title: t('dashboard.addPlate'),
      description: 'Ajouter un nouveau plat à votre collection',
      icon: ChefHat,
      link: '/mes-plats',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Planifier la semaine',
      description: 'Organiser vos repas pour la semaine',
      icon: Calendar,
      link: '/programmation',
      color: 'from-green-500 to-green-600'
    },
    {
      title: t('dashboard.generateList'),
      description: 'Créer votre liste de courses',
      icon: ShoppingCart,
      link: '/liste-de-courses',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: t('dashboard.askAI'),
      description: 'Obtenir des conseils nutritionnels',
      icon: Bot,
      link: '/assistant',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  // Les statistiques sont maintenant basées sur les états dynamiques
  const stats = [
    {
      title: 'Plats enregistrés',
      value: totalDishes.toString(),
      icon: ChefHat,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Repas planifiés',
      value: plannedMealsCount.toString(),
      icon: Calendar,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Personnes',
      value: totalHouseholdSize.toString(),
      icon: Users,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Articles de courses',
      value: totalShoppingItems.toString(),
      icon: Package,
      color: 'text-pink-600 bg-pink-100'
    },
    {
      title: 'Budget estimé',
      value: `${totalEstimatedBudget.toFixed(2)}€`,
      icon: DollarSign,
      color: 'text-red-600 bg-red-100'
    },
    {
      title: 'Articles achetés',
      value: totalPurchasedItems.toString(),
      icon: CheckCircle2,
      color: 'text-teal-600 bg-teal-100'
    }
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t('dashboard.welcome')}, {user?.firstName || 'Utilisateur'} ! 👋
              </h1>
              <p className="text-green-100 text-lg">
                Prêt à planifier de délicieux repas pour cette semaine ?
              </p>
            </div>
            
            <div className="mt-6 md:mt-0">
              <Link
                to="/programmation"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Planifier cette semaine</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 animate-slide-up">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('dashboard.quickActions')}
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.link}
                    className="group p-6 bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {action.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Week Menu Preview */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('dashboard.weekMenu')}
              </h2>
              <Link
                to="/programmation"
                className="text-green-600 hover:text-green-700 font-medium transition-colors"
              >
                Voir tout →
              </Link>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                {currentWeekMenu.length > 0 ? (
                  <div className="space-y-4">
                    {currentWeekMenu.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-green-600" />
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.day}</p>
                          <p className="text-sm text-gray-600">{item.meal}</p>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          item.type === 'lunch' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {item.type === 'lunch' ? 'Déjeuner' : 'Dîner'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      Aucun repas planifié pour cette semaine
                    </p>
                    <Link
                      to="/programmation"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Commencer la planification</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity (Still Static - consider a dedicated 'activities' collection for dynamic data) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activité récente</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Nouveau plat ajouté</p>
                <p className="text-sm text-gray-600">Salade de quinoa aux légumes • Il y a 2 heures</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Menu de la semaine mis à jour</p>
                <p className="text-sm text-gray-600">7 repas planifiés • Hier</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Conseil IA reçu</p>
                <p className="text-sm text-gray-600">Suggestions pour équilibrer votre alimentation • Il y a 3 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;