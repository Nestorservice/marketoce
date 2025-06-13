import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  ChefHat,
  Clock,
  Users,
  X,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Utensils,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

// Importe les fonctions et l'instance db de Firebase
import { db } from '../services/firebase'; // Assure-toi que le chemin est correct
import { collection, getDocs, doc, setDoc, deleteField, onSnapshot, query, where } from 'firebase/firestore';

interface Dish {
  id: string;
  name: string;
  category: 'petit_dejeuner' | 'dejeuner' | 'diner';
  cookingTime: number;
  servings: number;
  calories: number;
  isVegetarian: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSportFriendly: boolean;
}

interface MealPlan {
  date: string;
  petit_dejeuner?: Dish;
  dejeuner?: Dish;
  diner?: Dish;
}

const Programmation: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    return monday;
  });

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]); // Données des plats chargées depuis Firebase
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMealType, setSelectedMealType] = useState<'petit_dejeuner' | 'dejeuner' | 'diner'>('dejeuner');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Fonctions utilitaires de date ---
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });
  };

  const getWeekDays = useCallback(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeek);
      day.setDate(currentWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeek]);

  // --- Chargement des plats disponibles depuis Firestore ---
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'dishes'));
        const dishesList: Dish[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Dish)); // Assure-toi que les champs correspondent à l'interface Dish
        setAvailableDishes(dishesList);
      } catch (error) {
        console.error("Erreur lors du chargement des plats :", error);
        toast.error('Impossible de charger les plats disponibles.');
      }
    };

    fetchDishes();
  }, []); // Exécuté une seule fois au montage du composant

  // --- Chargement des plans de repas pour la semaine actuelle depuis Firestore (avec listener temps réel) ---
  useEffect(() => {
    const weekStart = formatDate(getWeekDays()[0]);
    const weekEnd = formatDate(getWeekDays()[6]);

    // Firestore ne supporte pas les requêtes "between" sur un seul champ pour la range
    // Nous allons plutôt récupérer tous les documents et filtrer côté client,
    // ou si le dataset est grand, structurer les requêtes par année/mois.
    // Pour une semaine, on peut récupérer tous les documents et filtrer.
    // MIEUX: Utiliser un champ 'timestamp' pour la date et des requêtes de range.
    // Pour cet exemple, nous allons écouter toute la collection et filtrer,
    // ce qui est acceptable pour un petit nombre de plans de repas, mais pas optimal pour des millions.

    const mealPlansRef = collection(db, 'mealPlans');
    // Une requête filtrée par date si tes dates sont des Timestamps ou des chaînes comparables.
    // Par exemple, si date est un champ Timestamp:
    // const q = query(mealPlansRef, where('date', '>=', weekStart), where('date', '<=', weekEnd));

    // Pour l'instant, on récupère tout pour simuler la portée de la semaine
    // et filtre en mémoire. Pour une application à grande échelle, utiliser
    // des requêtes plus fines avec des champs de date Timestamp.
    const unsubscribe = onSnapshot(mealPlansRef, (snapshot) => {
      const plansList: MealPlan[] = snapshot.docs.map(doc => ({
        date: doc.id, // L'ID du document est la date (YYYY-MM-DD)
        ...doc.data()
      } as MealPlan)).filter(plan => {
        // Filtrer les plans qui appartiennent à la semaine actuelle
        return plan.date >= weekStart && plan.date <= weekEnd;
      });
      setMealPlans(plansList);
    }, (error) => {
      console.error("Erreur lors du chargement des plans de repas :", error);
      toast.error('Impossible de charger les plans de repas.');
    });

    // Nettoyage de l'abonnement lors du démontage du composant ou du changement de semaine
    return () => unsubscribe();
  }, [currentWeek, getWeekDays]); // Re-exécuté si la semaine change

  // --- Logique d'ajout, mise à jour et suppression des plans de repas ---
  const getMealPlanForDate = (date: string): MealPlan => {
    return mealPlans.find(plan => plan.date === date) || { date };
  };

  const getDishesForMealType = (mealType: 'petit_dejeuner' | 'dejeuner' | 'diner') => {
    return availableDishes.filter(dish => dish.category === mealType);
  };

  const addDishToPlan = async (date: string, mealType: 'petit_dejeuner' | 'dejeuner' | 'diner', dish: Dish) => {
    const docRef = doc(db, 'mealPlans', date); // Référence au document pour la date
    const dishDataToSave = {
      id: dish.id,
      name: dish.name,
      category: dish.category,
      cookingTime: dish.cookingTime,
      servings: dish.servings,
      calories: dish.calories,
      isVegetarian: dish.isVegetarian,
      isHalal: dish.isHalal,
      isGlutenFree: dish.isGlutenFree,
      isSportFriendly: dish.isSportFriendly,
      // N'incluez pas d'autres champs lourds comme `description` ou `image` ici
      // si tu ne les utilises pas directement dans le plan de repas pour économiser l'espace.
    };

    try {
      await setDoc(docRef, {
        date: date, // Stocke la date aussi comme champ
        [mealType]: dishDataToSave // Ajoute ou écrase le plat pour ce type de repas
      }, { merge: true }); // 'merge: true' pour mettre à jour sans écraser les autres repas de la journée
      setIsModalOpen(false);
      toast.success('Plat ajouté au planning');
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat au planning :", error);
      toast.error('Impossible d\'ajouter le plat au planning.');
    }
  };

  const removeDishFromPlan = async (date: string, mealType: 'petit_dejeuner' | 'dejeuner' | 'diner') => {
    const docRef = doc(db, 'mealPlans', date);
    try {
      await setDoc(docRef, {
        [mealType]: deleteField() // Supprime le champ du type de repas
      }, { merge: true }); // 'merge: true' est crucial pour ne pas effacer les autres repas
      toast.success('Plat retiré du planning');
    } catch (error) {
      console.error("Erreur lors de la suppression du plat du planning :", error);
      toast.error('Impossible de retirer le plat du planning.');
    }
  };

  // --- Fonctions de navigation et de calcul ---
  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const openMealSelector = (date: string, mealType: 'petit_dejeuner' | 'dejeuner' | 'diner') => {
    setSelectedDate(date);
    setSelectedMealType(mealType);
    setIsModalOpen(true);
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels = {
      petit_dejeuner: 'Petit-déjeuner',
      dejeuner: 'Déjeuner',
      diner: 'Dîner'
    };
    return labels[mealType as keyof typeof labels] || mealType;
  };

  const getTotalCaloriesForDay = (date: string) => {
    const plan = getMealPlanForDate(date);
    let total = 0;
    if (plan.petit_dejeuner) total += plan.petit_dejeuner.calories;
    if (plan.dejeuner) total += plan.dejeuner.calories;
    if (plan.diner) total += plan.diner.calories;
    return total;
  };

  // --- Suggestions IA (simulées) ---
  const generateAISuggestions = async () => {
    toast.info('Génération des suggestions IA en cours...');

    try {
      // Pour une vraie intégration Gemini, tu ferais un appel API ici.
      // Par exemple, une fonction Firebase Cloud Function qui appelle Gemini
      // et retourne des suggestions basées sur les préférences de l'utilisateur.

      // Simulation de suggestions basées sur les plats disponibles
      const today = new Date();
      const dateStr = formatDate(today);

      const suggestedMeals: { type: 'petit_dejeuner' | 'dejeuner' | 'diner', dish: Dish | undefined }[] = [
        { type: 'petit_dejeuner', dish: availableDishes.find(d => d.category === 'petit_dejeuner' && d.id === '2') }, // Exemple: Omelette
        { type: 'dejeuner', dish: availableDishes.find(d => d.category === 'dejeuner' && d.id === '1') },     // Exemple: Salade quinoa
        { type: 'diner', dish: availableDishes.find(d => d.category === 'diner' && d.id === '3') }          // Exemple: Saumon
      ];

      for (const suggestion of suggestedMeals) {
        if (suggestion.dish) {
          await addDishToPlan(dateStr, suggestion.type, suggestion.dish);
        }
      }

      toast.success('Suggestions IA appliquées avec succès!');
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions IA :', error);
      toast.error('Erreur lors de la génération des suggestions.');
    }
  };

  const weekDays = getWeekDays();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Programmation des repas 🍽️</h1>
              <p className="text-green-100 text-lg">Planifiez vos repas intelligemment pour la semaine</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={generateAISuggestions}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Suggestions IA
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Statistiques
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation semaine */}
        <Card className="border-2 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={previousWeek} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Semaine précédente
              </Button>

              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Semaine du {formatDisplayDate(weekDays[0])}
                </h2>
                <p className="text-sm text-gray-500">
                  au {formatDisplayDate(weekDays[6])}
                </p>
              </div>

              <Button variant="outline" onClick={nextWeek} className="flex items-center gap-2">
                Semaine suivante
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planning hebdomadaire */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dateStr = formatDate(day);
            const plan = getMealPlanForDate(dateStr);
            const totalCalories = getTotalCaloriesForDay(dateStr);
            const isToday = formatDate(new Date()) === dateStr;

            return (
              <Card
                key={dateStr}
                className={`transition-all duration-200 hover:shadow-lg ${
                  isToday ? 'ring-2 ring-green-500 shadow-lg' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-center">
                    <div className={`text-sm font-bold ${isToday ? 'text-green-600' : 'text-gray-700'}`}>
                      {formatDisplayDate(day)}
                    </div>
                    {isToday && (
                      <Badge className="mt-1 bg-green-500 text-white text-xs">
                        Aujourd'hui
                      </Badge>
                    )}
                  </CardTitle>
                  {totalCalories > 0 && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        {totalCalories} cal
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0 space-y-4">
                  {/* Petit-déjeuner */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-orange-600 uppercase flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      Petit-déjeuner
                    </h4>
                    {plan.petit_dejeuner ? (
                      <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg relative group hover:shadow-md transition-shadow">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDishFromPlan(dateStr, 'petit_dejeuner')}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="pr-6">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {plan.petit_dejeuner.name}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {plan.petit_dejeuner.cookingTime}min
                            </div>
                            <div className="font-medium text-orange-600">
                              {plan.petit_dejeuner.calories} cal
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => openMealSelector(dateStr, 'petit_dejeuner')}
                        className="w-full h-16 border-2 border-dashed border-orange-300 text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    )}
                  </div>

                  {/* Déjeuner */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-green-600 uppercase flex items-center gap-1">
                      <ChefHat className="w-3 h-3" />
                      Déjeuner
                    </h4>
                    {plan.dejeuner ? (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg relative group hover:shadow-md transition-shadow">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDishFromPlan(dateStr, 'dejeuner')}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="pr-6">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {plan.dejeuner.name}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {plan.dejeuner.cookingTime}min
                            </div>
                            <div className="font-medium text-green-600">
                              {plan.dejeuner.calories} cal
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => openMealSelector(dateStr, 'dejeuner')}
                        className="w-full h-16 border-2 border-dashed border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    )}
                  </div>

                  {/* Dîner */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-blue-600 uppercase flex items-center gap-1">
                      <Utensils className="w-3 h-3" />
                      Dîner
                    </h4>
                    {plan.diner ? (
                      <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg relative group hover:shadow-md transition-shadow">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDishFromPlan(dateStr, 'diner')}
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="pr-6">
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {plan.diner.name}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {plan.diner.cookingTime}min
                            </div>
                            <div className="font-medium text-blue-600">
                              {plan.diner.calories} cal
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => openMealSelector(dateStr, 'diner')}
                        className="w-full h-16 border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Ajouter
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Modal de sélection des plats */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5" />
                Choisir un plat pour {getMealTypeLabel(selectedMealType)}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {getDishesForMealType(selectedMealType).map((dish) => (
                <Card
                  key={dish.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => addDishToPlan(selectedDate, selectedMealType, dish)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{dish.name}</h3>
                        <p className="text-sm text-gray-500 mb-3">Cliquez pour ajouter</p>

                        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {dish.cookingTime}min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {dish.servings}p
                          </div>
                          <div className="font-medium text-green-600">
                            {dish.calories} cal
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {dish.isVegetarian && (
                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                              Végétarien
                            </Badge>
                          )}
                          {dish.isHalal && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                              Halal
                            </Badge>
                          )}
                          {dish.isGlutenFree && (
                            <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                              Sans gluten
                            </Badge>
                          )}
                          {dish.isSportFriendly && (
                            <Badge variant="outline" className="text-purple-600 border-purple-200 text-xs">
                              Sport
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChefHat className="w-12 h-12 text-gray-300" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Programmation;