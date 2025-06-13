import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Package2,
  Search,
  Save,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { db } from '../../services/firebase'; // Assurez-vous que le chemin est correct
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
} from 'firebase/firestore';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  image?: string;
  stock: number;
  minStock: number;
  cost: number;
}

const categories = [
  'Fruits & Légumes',
  'Viande',
  'Poisson',
  'Produits Laitiers',
  'Épicerie',
  'Boissons',
];

const IngredientsManagement: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [form, setForm] = useState({
    name: '',
    category: '',
    unit: '',
    stock: 0,
    minStock: 0,
    cost: 0,
    image: '',
  });

  // --- Récupération des données depuis Firestore ---
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const ingredientsCol = collection(db, 'ingredients');
        // Trier les ingrédients par nom par défaut
        const q = query(ingredientsCol, orderBy('name'));
        const ingredientSnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
        const ingredientsList = ingredientSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Ingredient[];
        setIngredients(ingredientsList);
      } catch (error) {
        console.error('Erreur lors de la récupération des ingrédients: ', error);
        toast.error('Erreur lors du chargement des ingrédients.');
      }
    };

    fetchIngredients();
  }, []); // Le tableau vide assure que cela ne s'exécute qu'une fois au montage

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || ingredient.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockIngredients = ingredients.filter(ing => ing.stock <= ing.minStock);

  // --- Soumission du formulaire (Ajout/Modification) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Mode modification
        const ingredientRef = doc(db, 'ingredients', editingId);
        await updateDoc(ingredientRef, form);
        setIngredients(prev =>
          prev.map(ing =>
            ing.id === editingId
              ? { ...ing, ...form, id: editingId } // Assurez-vous que l'ID est maintenu
              : ing
          )
        );
        toast.success('Ingrédient modifié avec succès');
      } else {
        // Mode ajout
        const docRef = await addDoc(collection(db, 'ingredients'), form);
        setIngredients(prev => [...prev, { id: docRef.id, ...form }]);
        toast.success('Ingrédient ajouté avec succès');
      }
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la soumission de l'ingrédient: ", error);
      toast.error("Erreur lors de l'enregistrement de l'ingrédient.");
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      unit: '',
      stock: 0,
      minStock: 0,
      cost: 0,
      image: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setForm({
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      stock: ingredient.stock,
      minStock: ingredient.minStock,
      cost: ingredient.cost,
      image: ingredient.image || '',
    });
    setEditingId(ingredient.id);
    setShowForm(true);
  };

  // --- Suppression d'un ingrédient ---
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'ingredients', id));
      setIngredients(prev => prev.filter(ing => ing.id !== id));
      toast.success('Ingrédient supprimé');
    } catch (error) {
      console.error("Erreur lors de la suppression de l'ingrédient: ", error);
      toast.error("Erreur lors de la suppression de l'ingrédient.");
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Fruits & Légumes': 'bg-green-100 text-green-800',
      'Viande': 'bg-red-100 text-red-800',
      'Poisson': 'bg-blue-100 text-blue-800',
      'Produits Laitiers': 'bg-yellow-100 text-yellow-800',
      'Épicerie': 'bg-purple-100 text-purple-800',
      'Boissons': 'bg-orange-100 text-orange-800',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header avec alertes */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Ingrédients</h2>
          {lowStockIngredients.length > 0 && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">
                ⚠️ {lowStockIngredients.length} ingrédient(s) en rupture de stock
              </p>
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un ingrédient
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un ingrédient..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Toutes les catégories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="bg-emerald-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-emerald-800">
                {editingId ? "Modifier l'ingrédient" : 'Nouvel ingrédient'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Nom de l'ingrédient</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="unit">Unité</Label>
                <select
                  id="unit"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner une unité</option>
                  <option value="kg">Kilogramme (kg)</option>
                  <option value="g">Gramme (g)</option>
                  <option value="L">Litre (L)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="pièce">Pièce</option>
                  <option value="paquet">Paquet</option>
                </select>
              </div>

              <div>
                <Label htmlFor="stock">Stock actuel</Label>
                <Input
                  id="stock"
                  type="number"
                  value={form.stock}
                  onChange={e => setForm({ ...form, stock: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="minStock">Stock minimum</Label>
                <Input
                  id="minStock"
                  type="number"
                  value={form.minStock}
                  onChange={e => setForm({ ...form, minStock: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cost">Prix unitaire (€)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={form.cost}
                  onChange={e => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="image">URL de l'image</Label>
                <Input
                  id="image"
                  value={form.image}
                  onChange={e => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2 flex gap-4">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des ingrédients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredIngredients.map(ingredient => (
          <Card
            key={ingredient.id}
            className={`hover:shadow-lg transition-all ${
              ingredient.stock <= ingredient.minStock ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Badge className={getCategoryColor(ingredient.category)}>
                  {ingredient.category}
                </Badge>
                {ingredient.stock <= ingredient.minStock && (
                  <Badge variant="destructive" className="text-xs">
                    Stock bas
                  </Badge>
                )}
              </div>

              <div className="text-center mb-4">
                {ingredient.image ? (
                  <img
                    src={ingredient.image}
                    alt={ingredient.name}
                    className="w-20 h-20 object-cover rounded-lg mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Package2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 mb-1">{ingredient.name}</h3>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Stock:</span>
                  <span
                    className={`font-medium ${
                      ingredient.stock <= ingredient.minStock ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {ingredient.stock} {ingredient.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stock min:</span>
                  <span>
                    {ingredient.minStock} {ingredient.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Prix:</span>
                  <span className="font-medium">
                    {ingredient.cost}€/{ingredient.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ingredient)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(ingredient.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredIngredients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Package2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun ingrédient trouvé
            </h3>
            <p className="text-gray-600">Commencez par ajouter votre premier ingrédient</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IngredientsManagement;