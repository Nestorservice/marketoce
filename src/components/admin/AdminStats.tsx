import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Users, ChefHat, Calendar, ShoppingCart } from 'lucide-react';

// Import Firebase functions
import { db, collection, getDocs, query, where } from '../../services/firebase';
import { toast } from 'sonner'; // For notifications

const AdminStats: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [approvedDishes, setApprovedDishes] = useState<number>(0);
  const [weeklyPlans, setWeeklyPlans] = useState<number>(0);
  const [shoppingLists, setShoppingLists] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // --- Fetch Active Users ---
        // Assuming 'users' collection has a 'status' field.
        // You might define 'active' based on last login, specific flag, etc.
        // For simplicity, let's count all users for now.
        // If you have a 'lastActive' timestamp, you could query for users active in the last 7 days:
        // const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        // const usersQuery = query(collection(db, 'users'), where('lastActive', '>=', sevenDaysAgo));
        const usersSnapshot = await getDocs(collection(db, 'users'));
        setActiveUsers(usersSnapshot.size); // Count all documents in 'users' collection

        // --- Fetch Approved Dishes ---
        // Assuming 'dishes' collection with a 'status' field (e.g., 'pending', 'approved').
        const dishesQuery = query(collection(db, 'dishes'), where('status', '==', 'approved'));
        const dishesSnapshot = await getDocs(dishesQuery);
        setApprovedDishes(dishesSnapshot.size);

        // --- Fetch Weekly Plans ---
        // Assuming 'mealPlans' collection with a 'startDate' or 'weekNumber' field.
        // For simplicity, let's count all meal plans for now, or you could filter by current week.
        // A more advanced approach would involve checking if a plan's dates overlap with the current week.
        const plansSnapshot = await getDocs(collection(db, 'mealPlans'));
        setWeeklyPlans(plansSnapshot.size); // Counts all existing plans

        // --- Fetch Shopping Lists ---
        // Assuming 'shoppingLists' collection exists.
        const shoppingListsSnapshot = await getDocs(collection(db, 'shoppingLists'));
        setShoppingLists(shoppingListsSnapshot.size);

      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError("Failed to load statistics.");
        toast.error("Échec du chargement des statistiques.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []); // Empty dependency array means this runs once on mount

  const stats = [
    {
      title: 'Utilisateurs actifs',
      value: isLoading ? '...' : activeUsers.toString(),
      change: '+12%', // These changes are static, you'd need more data/logic for dynamic changes
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'Plats approuvés',
      value: isLoading ? '...' : approvedDishes.toString(),
      change: '+18%',
      icon: ChefHat,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: 'Plannings cette semaine',
      value: isLoading ? '...' : weeklyPlans.toString(),
      change: '+25%',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-100'
    },
    {
      title: 'Listes de courses',
      value: isLoading ? '...' : shoppingLists.toString(),
      change: '+31%',
      icon: ShoppingCart,
      color: 'text-purple-600 bg-purple-100'
    }
  ];

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <p>Veuillez vérifier votre connexion et les règles de sécurité Firebase.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-green-600 text-sm font-medium bg-green-100 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminStats;