import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Edit,
  Trash2,
  Image,
  Plus,
  Search,
  Filter,
  Save,
  X,
  Eye,
  Star,
  Clock,
  Users
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
  where,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

interface Ingredient {
  id: string;
  name: string;
  image?: string;
}

interface DishIngredient {
  ingredientId: string;
  quantity: number;
  unit: string;
}

interface Dish {
  id: string;
  name: string;
  category: string;
  description: string;
  approved: boolean;
  prepTime: number;
  servings: number;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  rating: number;
  nutritionalInfo: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
  dietaryFlags: {
    vegetarian: boolean;
    halal: boolean;
    glutenFree: boolean;
    sportFriendly: boolean;
  };
  ingredients: DishIngredient[];
  image?: string;
}

// Données simulées d'ingrédients avec images (ces données peuvent aussi venir de Firestore)
const availableIngredients: Ingredient[] = [
  { id: '1', name: 'Tomates cerises', image: '/placeholder.svg' },
  { id: '2', name: 'Quinoa bio', image: '/placeholder.svg' },
  { id: '3', name: 'Saumon atlantique', image: '/placeholder.svg' },
  { id: '4', name: 'Avocat', image: '/placeholder.svg' },
  { id: '5', name: 'Feta', image: '/placeholder.svg' },
  { id: '6', name: 'Roquette', image: '/placeholder.svg' },
  { id: '7', name: 'Huile d\'olive', image: '/placeholder.svg' },
  { id: '8', name: 'Citron', image: '/placeholder.svg' },
];

const DishesManagement: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterApproved, setFilterApproved] = useState<string>('');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    prepTime: 0,
    servings: 1,
    difficulty: 'Facile' as 'Facile' | 'Moyen' | 'Difficile',
    image: '',
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
    vegetarian: false,
    halal: false,
    glutenFree: false,
    sportFriendly: false,
    ingredients: [] as DishIngredient[]
  });

  const categories = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Collation', 'Dessert'];

  // --- Récupération des données depuis Firestore ---
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const dishesCol = collection(db, 'dishes');
        const dishSnapshot: QuerySnapshot<DocumentData> = await getDocs(dishesCol);
        const dishesList = dishSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Dish[];
        setDishes(dishesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des plats: ", error);
        toast.error("Erreur lors du chargement des plats.");
      }
    };

    fetchDishes();
  }, []); // Le tableau vide assure que cela ne s'exécute qu'une fois au montage

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || dish.category === filterCategory;
    const matchesApproved = !filterApproved ||
                            (filterApproved === 'approved' && dish.approved) ||
                            (filterApproved === 'pending' && !dish.approved);
    return matchesSearch && matchesCategory && matchesApproved;
  });

  const getIngredientInfo = (ingredientId: string) => {
    return availableIngredients.find(ing => ing.id === ingredientId);
  };

  // --- Soumission du formulaire (Ajout/Modification) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const dishRef = doc(db, 'dishes', editingId);
        await updateDoc(dishRef, {
          ...form,
          nutritionalInfo: {
            protein: form.protein,
            carbs: form.carbs,
            fat: form.fat,
            calories: form.calories
          },
          dietaryFlags: {
            vegetarian: form.vegetarian,
            halal: form.halal,
            glutenFree: form.glutenFree,
            sportFriendly: form.sportFriendly
          },
          approved: false // Reset approval when edited
        });
        setDishes(prev => prev.map(dish =>
          dish.id === editingId
            ? {
                ...dish,
                ...form,
                nutritionalInfo: {
                  protein: form.protein,
                  carbs: form.carbs,
                  fat: form.fat,
                  calories: form.calories
                },
                dietaryFlags: {
                  vegetarian: form.vegetarian,
                  halal: form.halal,
                  glutenFree: form.glutenFree,
                  sportFriendly: form.sportFriendly
                },
                approved: false // Reset approval when edited
              }
            : dish
        ));
        toast.success('Plat modifié avec succès');
      } else {
        const newDish: Omit<Dish, 'id' | 'rating'> = { // Omit id and rating as Firestore generates id and rating is 0 initially
          ...form,
          approved: false,
          nutritionalInfo: {
            protein: form.protein,
            carbs: form.carbs,
            fat: form.fat,
            calories: form.calories
          },
          dietaryFlags: {
            vegetarian: form.vegetarian,
            halal: form.halal,
            glutenFree: form.glutenFree,
            sportFriendly: form.sportFriendly
          }
        };
        const docRef = await addDoc(collection(db, 'dishes'), { ...newDish, rating: 0 }); // Add rating here
        setDishes(prev => [...prev, { ...newDish, id: docRef.id, rating: 0 }]); // Add to local state with generated ID
        toast.success('Plat ajouté avec succès');
      }
      resetForm();
    } catch (error) {
      console.error("Erreur lors de la soumission du plat: ", error);
      toast.error("Erreur lors de l'enregistrement du plat.");
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      description: '',
      prepTime: 0,
      servings: 1,
      difficulty: 'Facile',
      image: '',
      protein: 0,
      carbs: 0,
      fat: 0,
      calories: 0,
      vegetarian: false,
      halal: false,
      glutenFree: false,
      sportFriendly: false,
      ingredients: []
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (dish: Dish) => {
    setForm({
      name: dish.name,
      category: dish.category,
      description: dish.description,
      prepTime: dish.prepTime,
      servings: dish.servings,
      difficulty: dish.difficulty,
      image: dish.image || '',
      protein: dish.nutritionalInfo.protein,
      carbs: dish.nutritionalInfo.carbs,
      fat: dish.nutritionalInfo.fat,
      calories: dish.nutritionalInfo.calories,
      vegetarian: dish.dietaryFlags.vegetarian,
      halal: dish.dietaryFlags.halal,
      glutenFree: dish.dietaryFlags.glutenFree,
      sportFriendly: dish.dietaryFlags.sportFriendly,
      ingredients: dish.ingredients
    });
    setEditingId(dish.id);
    setShowForm(true);
  };

  // --- Suppression d'un plat ---
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'dishes', id));
      setDishes(prev => prev.filter(dish => dish.id !== id));
      toast.success('Plat supprimé');
    } catch (error) {
      console.error("Erreur lors de la suppression du plat: ", error);
      toast.error("Erreur lors de la suppression du plat.");
    }
  };

  // --- Approbation d'un plat ---
  const handleApprove = async (id: string) => {
    try {
      const dishRef = doc(db, 'dishes', id);
      await updateDoc(dishRef, { approved: true });
      setDishes(prev => prev.map(dish =>
        dish.id === id ? { ...dish, approved: true } : dish
      ));
      toast.success('Plat approuvé');
    } catch (error) {
      console.error("Erreur lors de l'approbation du plat: ", error);
      toast.error("Erreur lors de l'approbation du plat.");
    }
  };

  const addIngredient = () => {
    setForm(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { ingredientId: '', quantity: 0, unit: '' }]
    }));
  };

  const removeIngredient = (index: number) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index: number, field: keyof DishIngredient, value: any) => {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Plats</h2>
          <p className="text-gray-600">Création et gestion des recettes avec ingrédients</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un plat
        </Button>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
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
              value={filterApproved}
              onChange={(e) => setFilterApproved(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">Tous les statuts</option>
              <option value="approved">Approuvés</option>
              <option value="pending">En attente</option>
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
                {editingId ? 'Modifier le plat' : 'Nouveau plat'}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Nom du plat</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({...form, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="prepTime">Temps de préparation (min)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={form.prepTime}
                    onChange={(e) => setForm({...form, prepTime: parseInt(e.target.value) || 0})}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="servings">Nombre de portions</Label>
                  <Input
                    id="servings"
                    type="number"
                    value={form.servings}
                    onChange={(e) => setForm({...form, servings: parseInt(e.target.value) || 1})}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulté</Label>
                  <select
                    id="difficulty"
                    value={form.difficulty}
                    onChange={(e) => setForm({...form, difficulty: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Facile">Facile</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Difficile">Difficile</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="image">URL de l'image</Label>
                  <Input
                    id="image"
                    value={form.image}
                    onChange={(e) => setForm({...form, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({...form, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              {/* Ingrédients */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Ingrédients</Label>
                  <Button type="button" onClick={addIngredient} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter
                  </Button>
                </div>

                <div className="space-y-3">
                  {form.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <select
                          value={ingredient.ingredientId}
                          onChange={(e) => updateIngredient(index, 'ingredientId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Sélectionner un ingrédient</option>
                          {availableIngredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qté"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.1"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Unité</option>
                          <option value="g">g</option>
                          <option value="kg">kg</option>
                          <option value="ml">ml</option>
                          <option value="L">L</option>
                          <option value="pièce">pièce</option>
                          <option value="cuillères">cuillères</option>
                        </select>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        size="sm"
                        variant="destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Informations nutritionnelles */}
              <div>
                <Label className="text-base font-medium">Informations nutritionnelles (par portion)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <div>
                    <Label htmlFor="protein">Protéines (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={form.protein}
                      onChange={(e) => setForm({...form, protein: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbs">Glucides (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      value={form.carbs}
                      onChange={(e) => setForm({...form, carbs: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fat">Lipides (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      value={form.fat}
                      onChange={(e) => setForm({...form, fat: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={form.calories}
                      onChange={(e) => setForm({...form, calories: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Drapeaux alimentaires */}
              <div>
                <Label className="text-base font-medium">Préférences alimentaires</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.vegetarian}
                      onChange={(e) => setForm({...form, vegetarian: e.target.checked})}
                      className="rounded"
                    />
                    Végétarien
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.halal}
                      onChange={(e) => setForm({...form, halal: e.target.checked})}
                      className="rounded"
                    />
                    Halal
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.glutenFree}
                      onChange={(e) => setForm({...form, glutenFree: e.target.checked})}
                      className="rounded"
                    />
                    Sans gluten
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.sportFriendly}
                      onChange={(e) => setForm({...form, sportFriendly: e.target.checked})}
                      className="rounded"
                    />
                    Sport
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
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

      {/* Liste des plats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{dish.name}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {dish.prepTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {dish.servings} pers.
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {dish.rating ? dish.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Badge className={dish.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {dish.approved ? 'Approuvé' : 'En attente'}
                  </Badge>
                  <Badge variant="outline">{dish.difficulty}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {dish.image ? (
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <Image className="w-12 h-12 text-gray-400" />
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4">{dish.description}</p>

              {/* Ingrédients avec images */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Ingrédients ({dish.ingredients.length})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {dish.ingredients.slice(0, 4).map((ingredient, index) => {
                    const ingredientInfo = getIngredientInfo(ingredient.ingredientId);
                    return ingredientInfo ? (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <img
                          src={ingredientInfo.image}
                          alt={ingredientInfo.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{ingredientInfo.name}</p>
                          <p className="text-xs text-gray-500">{ingredient.quantity} {ingredient.unit}</p>
                        </div>
                      </div>
                    ) : null;
                  })}
                  {dish.ingredients.length > 4 && (
                    <div className="flex items-center justify-center p-2 bg-gray-100 rounded text-xs text-gray-500">
                      +{dish.ingredients.length - 4} autres
                    </div>
                  )}
                </div>
              </div>

              {/* Informations nutritionnelles */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Nutrition (par portion)</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="font-medium">{dish.nutritionalInfo.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protéines:</span>
                    <span className="font-medium">{dish.nutritionalInfo.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Glucides:</span>
                    <span className="font-medium">{dish.nutritionalInfo.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lipides:</span>
                    <span className="font-medium">{dish.nutritionalInfo.fat}g</span>
                  </div>
                </div>
              </div>

              {/* Drapeaux alimentaires */}
              <div className="flex flex-wrap gap-1 mb-4">
                {dish.dietaryFlags.vegetarian && (
                  <Badge variant="outline" className="text-green-600 text-xs">Végétarien</Badge>
                )}
                {dish.dietaryFlags.halal && (
                  <Badge variant="outline" className="text-blue-600 text-xs">Halal</Badge>
                )}
                {dish.dietaryFlags.glutenFree && (
                  <Badge variant="outline" className="text-orange-600 text-xs">Sans gluten</Badge>
                )}
                {dish.dietaryFlags.sportFriendly && (
                  <Badge variant="outline" className="text-purple-600 text-xs">Sport</Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDish(dish)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Voir
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(dish)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                {!dish.approved && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleApprove(dish.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    ✓
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(dish.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun plat trouvé
            </h3>
            <p className="text-gray-600">
              Aucun plat ne correspond aux critères de recherche
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DishesManagement;