import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Calendar,
  Users,
  ChefHat,
  Plus,
  Edit,
  Trash2,
  Clock,
  TrendingUp,
  Filter,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../services/firebase'; // Ensure the path is correct
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  DocumentData,
  QuerySnapshot,
  orderBy,
  where, // For filtering by date, status, user
} from 'firebase/firestore';

interface MealPlan {
  id: string;
  userId: string;
  userName: string;
  date: string;
  meals: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  nutritionalInfo: {
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
  };
  status: 'planned' | 'completed' | 'cancelled';
}

const PlanningManagement: React.FC = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterUser, setFilterUser] = useState<string>('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);

  // --- Fetching data from Firestore ---
  useEffect(() => {
    const fetchMealPlans = async () => {
      setLoading(true);
      try {
        const mealPlansCol = collection(db, 'mealPlans');
        let q = query(mealPlansCol, orderBy('date', 'desc'), orderBy('userName'));

        // Apply filters
        if (filterStatus) {
          q = query(q, where('status', '==', filterStatus));
        }
        if (filterUser) {
          q = query(q, where('userId', '==', filterUser));
        }
        // For date filtering (by week), you'd need more complex logic.
        // For simplicity here, we'll assume 'date' is a string 'YYYY-MM-DD'
        // and we fetch all, then filter by week client-side, or implement
        // proper range queries if you want to filter directly in Firestore.
        // Example for date range: where('date', '>=', startDate) and where('date', '<=', endDate)

        const planSnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const plansList = planSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MealPlan[];
        setMealPlans(plansList);

        // Extract unique users for the filter dropdown
        const usersSet = new Set<string>();
        const usersArray: { id: string; name: string }[] = [];
        plansList.forEach(plan => {
          if (!usersSet.has(plan.userId)) {
            usersSet.add(plan.userId);
            usersArray.push({ id: plan.userId, name: plan.userName });
          }
        });
        setAvailableUsers(usersArray);

      } catch (error) {
        console.error('Error fetching meal plans: ', error);
        toast.error('Error loading meal plans.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlans();
  }, [filterStatus, filterUser, selectedWeek]); // Re-fetch when filters change

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'planned':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'planned':
        return 'Planifié';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  // Filter plans based on the selected week (client-side for simplicity here)
  const filteredPlansByWeek = mealPlans.filter(plan => {
    const planDate = new Date(plan.date);
    const selectedDate = new Date(selectedWeek);

    // Get the start of the week for both dates (e.g., Monday as first day)
    const getStartOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay(); // 0 for Sunday, 1 for Monday
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      return new Date(d.setDate(diff));
    };

    const startOfPlanWeek = getStartOfWeek(planDate);
    const startOfSelectedWeek = getStartOfWeek(selectedDate);

    // Compare year, month, and day for the start of the week
    return (
      startOfPlanWeek.getFullYear() === startOfSelectedWeek.getFullYear() &&
      startOfPlanWeek.getMonth() === startOfSelectedWeek.getMonth() &&
      startOfPlanWeek.getDate() === startOfSelectedWeek.getDate()
    );
  });

  const weeklyStats = {
    totalPlans: filteredPlansByWeek.length,
    completedPlans: filteredPlansByWeek.filter(p => p.status === 'completed').length,
    averageCalories:
      Math.round(
        filteredPlansByWeek.reduce((sum, p) => sum + p.nutritionalInfo.totalCalories, 0) /
          filteredPlansByWeek.length
      ) || 0,
    totalUsers: Array.from(new Set(filteredPlansByWeek.map(p => p.userId))).length,
  };

  // --- Delete a meal plan from Firestore ---
  const handleDeletePlan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'mealPlans', id));
      setMealPlans(prev => prev.filter(plan => plan.id !== id));
      toast.success('Planning supprimé avec succès');
    } catch (error) {
      console.error('Error deleting meal plan: ', error);
      toast.error('Error deleting planning.');
    }
  };

  // --- Update meal plan status in Firestore ---
  const handleStatusChange = async (
    id: string,
    newStatus: 'planned' | 'completed' | 'cancelled'
  ) => {
    try {
      const planRef = doc(db, 'mealPlans', id);
      await updateDoc(planRef, { status: newStatus });
      setMealPlans(prev =>
        prev.map(plan => (plan.id === id ? { ...plan, status: newStatus } : plan))
      );
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating meal plan status: ', error);
      toast.error('Error updating status.');
    }
  };

  const exportWeeklyReport = () => {
    toast.info('Exportation du rapport hebdomadaire...');
    // Implement actual export logic here, e.g., generate CSV/PDF from filteredPlansByWeek
  };

  const generateAutomaticPlanning = async () => {
    // This is a placeholder. In a real app, this would involve:
    // 1. Fetching user preferences/data.
    // 2. Fetching available dishes/ingredients.
    // 3. Running an algorithm to generate meal plans.
    // 4. Adding these new meal plans to Firestore.
    toast.success('Planning automatique généré pour tous les utilisateurs (simulé)');
    // Example of adding a new plan (you'd replace this with actual generated data)
    try {
        const newPlan: Omit<MealPlan, 'id'> = {
            userId: 'new-user-id',
            userName: 'Nouvel Utilisateur',
            date: new Date().toISOString().split('T')[0],
            meals: {
                breakfast: 'Smoothie aux fruits',
                lunch: 'Salade de poulet',
                dinner: 'Soupe de lentilles'
            },
            nutritionalInfo: {
                totalCalories: 1700,
                totalProtein: 70,
                totalCarbs: 150,
                totalFat: 50
            },
            status: 'planned'
        };
        const docRef = await addDoc(collection(db, 'mealPlans'), newPlan);
        setMealPlans(prev => [...prev, { id: docRef.id, ...newPlan }]);
        toast.success('Nouveau planning auto ajouté!');
    } catch (error) {
        console.error('Error generating automatic plan: ', error);
        toast.error('Error generating automatic plan.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des plannings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion du Planning</h2>
          <p className="text-gray-600">Planification des repas pour tous les utilisateurs</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateAutomaticPlanning} className="bg-violet-600 hover:bg-violet-700">
            <Plus className="w-5 h-5 mr-2" />
            Génération Auto
          </Button>
          <Button onClick={exportWeeklyReport} variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Export Rapport
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Plans</p>
                <p className="text-3xl font-bold">{weeklyStats.totalPlans}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Terminés</p>
                <p className="text-3xl font-bold">{weeklyStats.completedPlans}</p>
              </div>
              <Clock className="w-8 h-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">Calories moy.</p>
                <p className="text-3xl font-bold">{weeklyStats.averageCalories}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Utilisateurs</p>
                <p className="text-3xl font-bold">{weeklyStats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Semaine</label>
              <input
                type="date"
                value={selectedWeek}
                onChange={e => setSelectedWeek(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Tous les statuts</option>
                <option value="planned">Planifié</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
              <select
                value={filterUser}
                onChange={e => setFilterUser(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="">Tous les utilisateurs</option>
                {availableUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planning en vue calendrier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlansByWeek.map(plan => (
          <Card key={plan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{plan.userName}</CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(plan.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <Badge className={getStatusColor(plan.status)}>
                  {getStatusLabel(plan.status)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {/* Repas */}
              <div className="space-y-4 mb-6">
                {plan.meals.breakfast && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">🌅</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Petit-déjeuner</p>
                      <p className="text-sm text-gray-600">{plan.meals.breakfast}</p>
                    </div>
                  </div>
                )}

                {plan.meals.lunch && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">☀️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Déjeuner</p>
                      <p className="text-sm text-gray-600">{plan.meals.lunch}</p>
                    </div>
                  </div>
                )}

                {plan.meals.dinner && (
                  <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-200 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">🌙</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Dîner</p>
                      <p className="text-sm text-gray-600">{plan.meals.dinner}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations nutritionnelles */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-900 mb-3">Informations nutritionnelles</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">{plan.nutritionalInfo.totalCalories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protéines:</span>
                    <span className="font-medium">{plan.nutritionalInfo.totalProtein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucides:</span>
                    <span className="font-medium">{plan.nutritionalInfo.totalCarbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lipides:</span>
                    <span className="font-medium">{plan.nutritionalInfo.totalFat}g</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <select
                  value={plan.status}
                  onChange={e => handleStatusChange(plan.id, e.target.value as any)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="planned">Planifié</option>
                  <option value="completed">Terminé</option>
                  <option value="cancelled">Annulé</option>
                </select>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlansByWeek.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun planning trouvé</h3>
            <p className="text-gray-600">Aucun planning ne correspond aux filtres sélectionnés</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlanningManagement;