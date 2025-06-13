import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  ShoppingCart,
  Users,
  Calculator,
  TrendingUp,
  Plus,
  Download,
  Eye,
  Trash2,
  Calendar,
  DollarSign,
  Package,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../services/firebase'; // Ensure this path is correct for your Firebase setup
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  DocumentData,
  Timestamp, // Import Timestamp for date handling
} from 'firebase/firestore';

interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  category: string;
  purchased: boolean;
}

interface ShoppingList {
  id: string; // Firestore document ID
  userId: string;
  userName: string;
  weekStart: string; // Stored as YYYY-MM-DD
  weekEnd: string; // Stored as YYYY-MM-DD
  items: ShoppingListItem[];
  generatedAt: Timestamp; // Changed to Firebase Timestamp
  totalEstimatedCost: number;
  actualCost?: number;
  status: 'generated' | 'sent' | 'shopping' | 'completed';
  householdSize: number;
  dietaryPreferences: string[];
}

const ShoppingListsManagement: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // --- Fetching data from Firestore ---
  useEffect(() => {
    const fetchShoppingLists = async () => {
      setLoading(true);
      try {
        const listsCol = collection(db, 'shoppingLists');
        let q = query(listsCol, orderBy('weekStart', 'desc')); // Order by start date

        // Apply status filter if selected
        if (filterStatus) {
          q = query(q, where('status', '==', filterStatus));
        }

        // Apply month filter
        // For monthly filtering on `weekStart` (string 'YYYY-MM-DD'), we'll use client-side filter
        // or refine Firestore query for better performance with date ranges if `weekStart` was Timestamp.
        // For now, assume weekStart is 'YYYY-MM-DD' and filter client-side after fetching.
        // If 'weekStart' was a Firestore Timestamp, you'd use:
        // const startOfMonth = Timestamp.fromDate(new Date(selectedMonth + '-01'));
        // const endOfMonth = Timestamp.fromDate(new Date(new Date(selectedMonth + '-01').setMonth(new Date(selectedMonth + '-01').getMonth() + 1)));
        // q = query(q, where('weekStart', '>=', startOfMonth), where('weekStart', '<', endOfMonth));


        const listSnapshot = await getDocs(q);
        const listsData: ShoppingList[] = listSnapshot.docs.map(doc => {
          const data = doc.data() as Omit<ShoppingList, 'id' | 'generatedAt'> & { generatedAt: Timestamp };
          return {
            id: doc.id,
            ...data,
            generatedAt: data.generatedAt, // Firebase Timestamp object
          };
        });
        setShoppingLists(listsData);
      } catch (error) {
        console.error('Error fetching shopping lists: ', error);
        toast.error('Erreur lors du chargement des listes de courses.');
      } finally {
        setLoading(false);
      }
    };

    fetchShoppingLists();
  }, [filterStatus]); // selectedMonth will also trigger re-fetch as it changes

  // Filter lists based on the selected month (client-side as weekStart is string)
  const filteredLists = shoppingLists.filter(list => {
    return list.weekStart.startsWith(selectedMonth);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-blue-100 text-blue-800';
      case 'sent':
        return 'bg-yellow-100 text-yellow-800';
      case 'shopping':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'generated':
        return 'Générée';
      case 'sent':
        return 'Envoyée';
      case 'shopping':
        return 'En cours';
      case 'completed':
        return 'Terminée';
      default:
        return status;
    }
  };

  // Calculs avancés
  const monthlyStats = {
    totalLists: filteredLists.length,
    totalEstimatedCost: filteredLists.reduce((sum, list) => sum + list.totalEstimatedCost, 0),
    totalActualCost: filteredLists.reduce((sum, list) => sum + (list.actualCost || 0), 0),
    averageHouseholdSize:
      Math.round(
        filteredLists.reduce((sum, list) => sum + list.householdSize, 0) / filteredLists.length || 0
      ),
    completedLists: filteredLists.filter(list => list.status === 'completed').length,
    savingsRate: 0,
  };

  monthlyStats.savingsRate =
    monthlyStats.totalEstimatedCost > 0
      ? Math.round(
          ((monthlyStats.totalEstimatedCost - monthlyStats.totalActualCost) /
            monthlyStats.totalEstimatedCost) *
            100
        )
      : 0;

  const categoryStats = filteredLists.reduce((acc, list) => {
    list.items.forEach(item => {
      if (!acc[item.category]) {
        acc[item.category] = { totalCost: 0, itemCount: 0 };
      }
      acc[item.category].totalCost += item.estimatedPrice;
      acc[item.category].itemCount += 1;
    });
    return acc;
  }, {} as Record<string, { totalCost: number; itemCount: number }>);

  // --- Generate all lists (simulated and added to Firestore) ---
  const generateAllLists = async () => {
    toast.info('Génération automatique des listes pour tous les utilisateurs (simulé)...');
    try {
        // Simulate generating a new list
        const newShoppingList: Omit<ShoppingList, 'id'> = {
            userId: 'user-simule-123',
            userName: 'Nouvel Utilisateur',
            weekStart: '2024-06-17', // Example new dates
            weekEnd: '2024-06-23',
            householdSize: 3,
            dietaryPreferences: ['Standard', 'Sans gluten'],
            totalEstimatedCost: 110.00,
            generatedAt: Timestamp.now(), // Use Firebase Timestamp
            status: 'generated',
            items: [
                {
                    ingredientId: 'item1',
                    ingredientName: 'Riz Basmati',
                    quantity: 1,
                    unit: 'kg',
                    estimatedPrice: 3.50,
                    category: 'Épicerie',
                    purchased: false,
                },
                {
                    ingredientId: 'item2',
                    ingredientName: 'Poivrons',
                    quantity: 3,
                    unit: 'unités',
                    estimatedPrice: 4.80,
                    category: 'Fruits & Légumes',
                    purchased: false,
                },
            ],
        };
        const docRef = await addDoc(collection(db, 'shoppingLists'), newShoppingList);
        setShoppingLists(prev => [...prev, { id: docRef.id, ...newShoppingList }]);
        toast.success('Nouvelle liste de courses générée et ajoutée !');
    } catch (error) {
        console.error('Error generating shopping list: ', error);
        toast.error('Erreur lors de la génération automatique des listes.');
    }
  };

  const exportMonthlyReport = () => {
    toast.info('Exportation du rapport mensuel...');
    // Implement actual export logic here, e.g., generate CSV/PDF from filteredLists
  };

  const viewListDetails = (listId: string) => {
    toast.info(`Affichage des détails de la liste ${listId}`);
    // In a real app, you'd navigate to a detail page or open a modal
  };

  // --- Delete a shopping list from Firestore ---
  const deleteList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'shoppingLists', listId));
      setShoppingLists(prev => prev.filter(list => list.id !== listId));
      toast.success('Liste supprimée avec succès');
    } catch (error) {
      console.error('Error deleting shopping list: ', error);
      toast.error('Erreur lors de la suppression de la liste.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Chargement des listes de courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Listes de Courses</h2>
          <p className="text-gray-600">Génération et suivi des listes avec calculs avancés</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateAllLists} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-5 h-5 mr-2" />
            Générer Toutes
          </Button>
          <Button onClick={exportMonthlyReport} variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Rapport Mensuel
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Listes totales</p>
                <p className="text-2xl font-bold">{monthlyStats.totalLists}</p>
              </div>
              <ShoppingCart className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Terminées</p>
                <p className="text-2xl font-bold">{monthlyStats.completedLists}</p>
              </div>
              <Package className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Coût estimé</p>
                <p className="text-2xl font-bold">{monthlyStats.totalEstimatedCost.toFixed(0)}€</p>
              </div>
              <Calculator className="w-6 h-6 text-orange-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Coût réel</p>
                <p className="text-2xl font-bold">{monthlyStats.totalActualCost.toFixed(0)}€</p>
              </div>
              <DollarSign className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Foyer moyen</p>
                <p className="text-2xl font-bold">{monthlyStats.averageHouseholdSize}</p>
              </div>
              <Users className="w-6 h-6 text-indigo-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm">Économies</p>
                <p className="text-2xl font-bold">{monthlyStats.savingsRate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-teal-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Répartition par Catégorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Articles:</span>
                    <span className="font-medium">{stats.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coût total:</span>
                    <span className="font-medium">{stats.totalCost.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Coût moyen:</span>
                    <span className="font-medium">
                      {(stats.totalCost / stats.itemCount).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mois</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
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
                <option value="generated">Générée</option>
                <option value="sent">Envoyée</option>
                <option value="shopping">En cours</option>
                <option value="completed">Terminée</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listes de courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLists.map(list => {
          const completionRate =
            list.items.length > 0
              ? Math.round((list.items.filter(item => item.purchased).length / list.items.length) * 100)
              : 0;

          return (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{list.userName}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Semaine du {list.weekStart}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {list.householdSize} pers.
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(list.status)}>
                    {getStatusLabel(list.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Préférences alimentaires */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {list.dietaryPreferences.map(pref => (
                    <Badge key={pref} variant="outline" className="text-xs">
                      {pref}
                    </Badge>
                  ))}
                </div>

                {/* Progression */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progression</span>
                    <span>{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Informations financières */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Coût estimé</p>
                      <p className="text-lg font-bold text-gray-900">
                        {list.totalEstimatedCost.toFixed(2)}€
                      </p>
                    </div>
                    {list.actualCost !== undefined && ( // Check for undefined, not just falsy
                      <div>
                        <p className="text-gray-600">Coût réel</p>
                        <p className="text-lg font-bold text-gray-900">
                          {list.actualCost.toFixed(2)}€
                        </p>
                        <p
                          className={`text-xs ${
                            list.actualCost > list.totalEstimatedCost ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          {list.actualCost > list.totalEstimatedCost ? '+' : ''}
                          {(
                            ((list.actualCost - list.totalEstimatedCost) / list.totalEstimatedCost) *
                            100
                          ).toFixed(1)}
                          %
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aperçu des articles */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Articles ({list.items.length})</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {list.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className={item.purchased ? 'line-through text-gray-500' : ''}>
                          {item.ingredientName} ({item.quantity} {item.unit})
                        </span>
                        <span className="font-medium">{item.estimatedPrice.toFixed(2)}€</span>
                      </div>
                    ))}
                    {list.items.length > 3 && (
                      <p className="text-xs text-gray-500">+{list.items.length - 3} autres articles</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewListDetails(list.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Détails
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteList(list.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredLists.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune liste trouvée</h3>
            <p className="text-gray-600">
              Aucune liste de courses ne correspond aux filtres sélectionnés
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ShoppingListsManagement;