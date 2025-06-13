import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Badge } from '../components/ui/badge';
import {
  ShoppingCart,
  Plus,
  Download,
  Calendar,
  Package,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

// Importe les fonctions Firebase depuis votre fichier de service
import { db, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from '../services/firebase';

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
  estimatedTime: number;
  items: ShoppingItem[]; // This must always be an array
}

const ListeDeCourses: React.FC = () => {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);

  // Référence à la collection 'shoppingLists' dans Firestore
  const shoppingListsCollectionRef = collection(db, 'shoppingLists');

  // --- Chargement des listes de courses depuis Firestore (avec listener temps réel) ---
  useEffect(() => {
    // Utilise onSnapshot pour écouter les changements en temps réel
    const unsubscribe = onSnapshot(shoppingListsCollectionRef, (snapshot) => {
      const fetchedLists: ShoppingList[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Nom Inconnu', // Provide default values for safety
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          householdSize: data.householdSize || 0,
          estimatedBudget: data.estimatedBudget || 0,
          estimatedTime: data.estimatedTime || 0,
          // *** THE FIX IS HERE ***
          // Ensure 'items' is always an array, defaulting to an empty array if not present or not an array
          items: Array.isArray(data.items) ? data.items as ShoppingItem[] : [],
        };
      });
      setShoppingLists(fetchedLists);
    }, (error) => {
      console.error("Erreur lors du chargement des listes de courses :", error);
      toast.error('Impossible de charger les listes de courses. Vérifiez vos permissions Firestore.');
    });

    // Nettoyage de l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, []); // Exécuté une seule fois au montage du composant

  // --- Fonctions de manipulation des données avec Firebase ---

  // Générer une nouvelle liste de courses (simulée)
  const generateSmartShoppingList = async () => {
    toast.info('Génération d\'une nouvelle liste de courses...');
    try {
      const newId = Date.now().toString(); // Génère un ID unique pour le nouvel élément
      const currentDate = new Date().toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7); // 7 jours plus tard
      const futureDateStr = futureDate.toISOString().split('T')[0];

      const newShoppingList: Omit<ShoppingList, 'id'> = {
        name: `Liste Générée - ${currentDate}`,
        startDate: currentDate,
        endDate: futureDateStr,
        householdSize: 3,
        estimatedBudget: 100.00,
        estimatedTime: 50,
        items: [
          { id: `${newId}-item1`, name: 'Pommes', quantity: 1, unit: 'kg', category: 'Fruits & Légumes', estimatedPrice: 3.50, purchased: false },
          { id: `${newId}-item2`, name: 'Pains', quantity: 2, unit: 'unité', category: 'Boulangerie', estimatedPrice: 2.00, purchased: false },
          { id: `${newId}-item3`, name: 'Fromage', quantity: 200, unit: 'g', category: 'Produits Laitiers', estimatedPrice: 4.80, purchased: false },
        ],
      };

      // Ajoute la nouvelle liste à Firestore
      await addDoc(shoppingListsCollectionRef, newShoppingList);
      toast.success('Nouvelle liste de courses générée et ajoutée!');
    } catch (error) {
      console.error("Erreur lors de la génération de la liste :", error);
      toast.error('Erreur lors de la génération de la liste.');
    }
  };

  // Supprimer une liste de courses
  const deleteShoppingList = async (listId: string) => {
    try {
      await deleteDoc(doc(db, 'shoppingLists', listId));
      toast.success('Liste de courses supprimée!');
    } catch (error) {
      console.error("Erreur lors de la suppression de la liste :", error);
      toast.error('Erreur lors de la suppression de la liste.');
    }
  };

  // Basculer l'état 'acheté' d'un article
  const toggleItemPurchased = async (listId: string, itemId: string) => {
    try {
      const listToUpdate = shoppingLists.find(list => list.id === listId);

      if (listToUpdate && Array.isArray(listToUpdate.items)) { // Added Array.isArray check here too for safety
        const updatedItems = listToUpdate.items.map(item =>
          item.id === itemId
            ? { ...item, purchased: !item.purchased }
            : item
        );

        // Met à jour le document Firestore avec le tableau d'éléments modifié
        await updateDoc(doc(db, 'shoppingLists', listId), { items: updatedItems });
        toast.success('Article mis à jour!');
      } else {
        console.warn(`Liste ou articles introuvables pour listId: ${listId}`);
        toast.error("Liste ou articles introuvables pour la mise à jour.");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error);
      toast.error("Erreur lors de la mise à jour de l'article.");
    }
  };


  // --- Fonctions utilitaires existantes ---

  const exportToPDF = (list: ShoppingList) => {
    toast.info('Exportation en PDF...');
    // Logique d'exportation PDF ici (peut nécessiter une bibliothèque externe ou une fonction Cloud)
  };

  const groupItemsByCategory = (items: ShoppingItem[]) => {
    // Ensure items is an array before reducing
    if (!Array.isArray(items)) {
      return {};
    }
    return items.reduce((acc: { [key: string]: ShoppingItem[] }, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liste de courses</h1>
            <p className="text-gray-600">Gérez vos courses intelligemment</p>
          </div>

          <Button onClick={generateSmartShoppingList} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Générer nouvelle liste
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Listes actives</p>
                  <p className="text-2xl font-bold text-gray-900">{shoppingLists.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Articles totaux</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoppingLists.reduce((total, list) => total + (Array.isArray(list.items) ? list.items.length : 0), 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle2 className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoppingLists.reduce((total, list) =>
                      // *** THE FIX IS HERE ***
                      total + (Array.isArray(list.items) ? list.items.filter(item => item.purchased).length : 0), 0
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Budget estimé</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {shoppingLists.reduce((total, list) => total + list.estimatedBudget, 0).toFixed(2)}€
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shopping Lists */}
        <div className="space-y-6">
          {shoppingLists.map((list) => {
            // *** THE FIX IS HERE ***
            // Ensure list.items is an array before using it
            const itemsToDisplay = Array.isArray(list.items) ? list.items : [];
            const purchasedItemsCount = itemsToDisplay.filter(item => item.purchased).length;

            const progress = itemsToDisplay.length > 0
              ? (purchasedItemsCount / itemsToDisplay.length) * 100
              : 0;

            return (
              <Card key={list.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        {list.name}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Du {list.startDate} au {list.endDate}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {list.householdSize} personne{list.householdSize > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {list.estimatedTime} min
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        {list.estimatedBudget}€
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToPDF(list)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteShoppingList(list.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progression</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {/* Items by Category */}
                  {Object.entries(groupItemsByCategory(itemsToDisplay)).map(([category, items]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {category}
                        <Badge variant="secondary" className="text-xs">
                          {items.length}
                        </Badge>
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                              item.purchased
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <Checkbox
                              checked={item.purchased}
                              onCheckedChange={() => toggleItemPurchased(list.id, item.id)}
                            />

                            <div className="flex-grow">
                              <p className={`font-medium ${
                                item.purchased ? 'line-through text-gray-500' : 'text-gray-900'
                              }`}>
                                {item.name}
                              </p>
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{item.quantity} {item.unit}</span>
                                <span className="font-medium">{item.estimatedPrice}€</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {shoppingLists.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune liste de courses
              </h3>
              <p className="text-gray-600 mb-6">
                Commencez par créer votre première liste de courses intelligente
              </p>
              <Button onClick={generateSmartShoppingList}>
                <Plus className="w-5 h-5 mr-2" />
                Créer ma première liste
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ListeDeCourses;