import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Bell,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  DollarSign,
  Truck
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../services/firebase'; // Import your Firebase db instance
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';

interface StockItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  supplier: string;
  lastRestocked: string; // Stored as 'YYYY-MM-DD'
  weeklyConsumption: number;
  monthlyConsumption: number;
  stockValue: number;
  expirationDate?: string; // Stored as 'YYYY-MM-DD'
  status: 'optimal' | 'low' | 'critical' | 'overstocked';
}

const StockManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');

  // Function to calculate status based on currentStock, minStock, and maxStock
  const calculateStatus = (currentStock: number, minStock: number, maxStock: number): StockItem['status'] => {
    if (currentStock <= 0) return 'critical';
    if (currentStock <= minStock) return 'low';
    if (currentStock > maxStock) return 'overstocked';
    return 'optimal';
  };

  // Fetch data from Firestore
  useEffect(() => {
    const stockCollectionRef = collection(db, 'stockItems');

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(
      stockCollectionRef,
      (snapshot) => {
        const items: StockItem[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          const status = calculateStatus(data.currentStock, data.minStock, data.maxStock);
          return {
            id: doc.id,
            name: data.name,
            category: data.category,
            currentStock: data.currentStock,
            minStock: data.minStock,
            maxStock: data.maxStock,
            unit: data.unit,
            cost: data.cost,
            supplier: data.supplier,
            lastRestocked: data.lastRestocked,
            weeklyConsumption: data.weeklyConsumption,
            monthlyConsumption: data.monthlyConsumption,
            stockValue: parseFloat((data.currentStock * data.cost).toFixed(2)), // Recalculate on fetch
            expirationDate: data.expirationDate || undefined,
            status: status, // Set status dynamically
          };
        });
        setStockItems(items);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching stock items:', err);
        setError('Failed to load stock data.');
        setLoading(false);
        toast.error('Erreur lors du chargement des stocks.');
      }
    );

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs once on mount

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'overstocked': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case 'optimal': return <TrendingUp className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
      case 'overstocked': return <Package className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  }, []);

  const getStatusLabel = useCallback((status: string) => {
    switch (status) {
      case 'optimal': return 'Optimal';
      case 'low': return 'Stock bas';
      case 'critical': return 'Critique';
      case 'overstocked': return 'Surstock';
      default: return status;
    }
  }, []);

  const filteredItems = stockItems
    .filter(item => {
      const matchesCategory = !filterCategory || item.category === filterCategory;
      const matchesStatus = !filterStatus || item.status === filterStatus;
      return matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'stock': return a.currentStock - b.currentStock;
        case 'consumption': return b.weeklyConsumption - a.weeklyConsumption;
        case 'value': return b.stockValue - a.stockValue;
        default: return a.name.localeCompare(b.name);
      }
    });

  const categories = Array.from(new Set(stockItems.map(item => item.category)));

  const stockStats = {
    totalItems: stockItems.length,
    criticalItems: stockItems.filter(item => item.status === 'critical').length,
    lowStockItems: stockItems.filter(item => item.status === 'low').length,
    overstockedItems: stockItems.filter(item => item.status === 'overstocked').length,
    totalValue: stockItems.reduce((sum, item) => sum + item.stockValue, 0),
    weeklyConsumption: stockItems.reduce((sum, item) => sum + item.weeklyConsumption * item.cost, 0),
    monthlyConsumption: stockItems.reduce((sum, item) => sum + item.monthlyConsumption * item.cost, 0)
  };

  const alerts = stockItems.filter(item =>
    item.status === 'critical' ||
    item.status === 'low' ||
    (item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000))
  );

  const predictedStockout = stockItems.map(item => {
    const daysUntilStockout = item.weeklyConsumption > 0
      ? Math.floor((item.currentStock / item.weeklyConsumption) * 7)
      : Infinity;
    return { ...item, daysUntilStockout };
  }).filter(item => item.daysUntilStockout <= 7 && item.daysUntilStockout > 0);

  // Function to update stock in Firestore
  const handleRestock = async (itemId: string, quantity: number) => {
    const itemRef = doc(db, 'stockItems', itemId);
    const itemToUpdate = stockItems.find(item => item.id === itemId);

    if (itemToUpdate) {
      const newCurrentStock = itemToUpdate.currentStock + quantity;
      const newStatus = calculateStatus(newCurrentStock, itemToUpdate.minStock, itemToUpdate.maxStock);
      const newStockValue = parseFloat((newCurrentStock * itemToUpdate.cost).toFixed(2));

      try {
        await updateDoc(itemRef, {
          currentStock: newCurrentStock,
          lastRestocked: new Date().toISOString().split('T')[0],
          stockValue: newStockValue,
          status: newStatus, // Update status in Firestore
        });
        toast.success(`Stock mis à jour: +${quantity} unités pour ${itemToUpdate.name}`);
      } catch (e) {
        console.error('Error updating document: ', e);
        toast.error('Erreur lors de la mise à jour du stock.');
      }
    }
  };

  const generateRestockOrders = () => {
    const itemsToRestock = stockItems.filter(item => item.status === 'critical' || item.status === 'low');
    if (itemsToRestock.length > 0) {
      toast.success(`${itemsToRestock.length} commandes de réapprovisionnement générées`);
      // In a real application, you'd send these orders to a backend system
      console.log('Items à commander:', itemsToRestock);
    } else {
      toast.info('Aucun article à réapprovisionner.');
    }
  };

  const exportStockReport = () => {
    toast.info('Exportation du rapport de stock...');
    // Implement actual report generation and download logic here
    console.log('Génération du rapport de stock...');
  };

  if (loading) {
    return <div className="text-center py-8">Chargement des données de stock...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Erreur: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Stocks</h2>
          <p className="text-gray-600">Suivi avancé et prédictions intelligentes</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateRestockOrders} className="bg-orange-600 hover:bg-orange-700">
            <Truck className="w-5 h-5 mr-2" />
            Commander
          </Button>
          <Button onClick={exportStockReport} variant="outline">
            <Download className="w-5 h-5 mr-2" />
            Rapport
          </Button>
        </div>
      </div>

      {/* Alertes critiques */}
      {alerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <AlertDescription>
            <span className="font-medium text-red-800">
              {alerts.length} alerte(s) nécessitent votre attention immédiate
            </span>
            <div className="mt-2 space-y-1">
              {alerts.slice(0, 3).map(item => (
                <div key={item.id} className="text-sm text-red-700">
                  • {item.name}: {item.status === 'critical' ? 'Stock critique' : 'Stock bas'}
                  {item.expirationDate && new Date(item.expirationDate) <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) &&
                    ' - Expire bientôt'
                  }
                </div>
              ))}
              {alerts.length > 3 && (
                <div className="text-sm text-red-700">
                  ... et {alerts.length - 3} autre(s)
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <Card className="bg-gradient-to-r from-slate-500 to-slate-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-100 text-sm">Articles totaux</p>
                <p className="text-2xl font-bold">{stockStats.totalItems}</p>
              </div>
              <Package className="w-6 h-6 text-slate-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Critiques</p>
                <p className="text-2xl font-bold">{stockStats.criticalItems}</p>
              </div>
              <AlertTriangle className="w-6 h-6 text-red-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Stock bas</p>
                <p className="text-2xl font-bold">{stockStats.lowStockItems}</p>
              </div>
              <TrendingDown className="w-6 h-6 text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Surstock</p>
                <p className="text-2xl font-bold">{stockStats.overstockedItems}</p>
              </div>
              <Package className="w-6 h-6 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Valeur stock</p>
                <p className="text-2xl font-bold">{stockStats.totalValue.toFixed(0)}€</p>
              </div>
              <DollarSign className="w-6 h-6 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Conso. semaine</p>
                <p className="text-2xl font-bold">{stockStats.weeklyConsumption.toFixed(0)}€</p>
              </div>
              <BarChart3 className="w-6 h-6 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Conso. mois</p>
                <p className="text-2xl font-bold">{stockStats.monthlyConsumption.toFixed(0)}€</p>
              </div>
              <Calendar className="w-6 h-6 text-indigo-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prédictions de rupture de stock */}
      {predictedStockout.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="bg-orange-100">
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Prédictions de Rupture de Stock (7 jours)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {predictedStockout.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-4 border border-orange-200">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">Stock actuel: {item.currentStock} {item.unit}</p>
                  <p className="text-sm font-medium text-orange-600">
                    Rupture prévue dans {item.daysUntilStockout} jour(s)
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-orange-600 hover:bg-orange-700"
                    onClick={() => handleRestock(item.id, item.maxStock - item.currentStock)}
                  >
                    Réapprovisionner
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtres et tri */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="optimal">Optimal</option>
              <option value="low">Stock bas</option>
              <option value="critical">Critique</option>
              <option value="overstocked">Surstock</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="name">Trier par nom</option>
              <option value="stock">Trier par stock</option>
              <option value="consumption">Trier par consommation</option>
              <option value="value">Trier par valeur</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des stocks */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire Détaillé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Article</th>
                  <th className="text-left p-3">Catégorie</th>
                  <th className="text-left p-3">Stock</th>
                  <th className="text-left p-3">Statut</th>
                  <th className="text-left p-3">Consommation</th>
                  <th className="text-left p-3">Valeur</th>
                  <th className="text-left p-3">Fournisseur</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Min: {item.minStock} | Max: {item.maxStock}
                        </p>
                        {item.expirationDate && (
                          <p className="text-xs text-orange-600">
                            Expire: {new Date(item.expirationDate).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{item.category}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${
                          item.status === 'critical' ? 'text-red-600' :
                            item.status === 'low' ? 'text-yellow-600' : 'text-gray-900'
                          }`}>
                          {item.currentStock} {item.unit}
                        </span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.status === 'critical' ? 'bg-red-500' :
                                item.status === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                            style={{
                              width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(item.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(item.status)}
                          {getStatusLabel(item.status)}
                        </span>
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p>{item.weeklyConsumption} {item.unit}/sem</p>
                        <p className="text-gray-500">{item.monthlyConsumption} {item.unit}/mois</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p className="font-medium">{item.stockValue.toFixed(2)}€</p>
                        <p className="text-gray-500">{item.cost}€/{item.unit}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <p>{item.supplier}</p>
                        <p className="text-gray-500">
                          Dernier: {new Date(item.lastRestocked).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRestock(item.id, 10)}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        {(item.status === 'critical' || item.status === 'low') && (
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700"
                            onClick={() => handleRestock(item.id, item.maxStock - item.currentStock)}
                          >
                            <Truck className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockManagement;