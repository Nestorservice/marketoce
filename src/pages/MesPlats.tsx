import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Plus,
  Search,
  Heart,
  Clock,
  Users,
  Edit,
  Trash2,
  ChefHat,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

// Importez les fonctions Firestore
import { db, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '../services/firebase'; // Assurez-vous que le chemin est correct

interface Dish {
  id: string;
  name: string;
  description: string;
  category: 'petit_dejeuner' | 'dejeuner' | 'diner';
  cookingTime: number;
  servings: number;
  difficulty: 'facile' | 'moyen' | 'difficile';
  image?: string;
  isFavorite: boolean;
  isVegetarian: boolean;
  isHalal: boolean;
  isGlutenFree: boolean;
  isSportFriendly: boolean;
  ingredients: { name: string; quantity: number; unit: string }[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  approved: boolean;
  createdAt: string;
}

const MesPlats: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  const [newDish, setNewDish] = useState<Partial<Dish>>({
    name: '',
    description: '',
    category: 'dejeuner',
    cookingTime: 30,
    servings: 4,
    difficulty: 'moyen',
    image: '',
    isVegetarian: false,
    isHalal: false,
    isGlutenFree: false,
    isSportFriendly: false,
    ingredients: [],
    instructions: [],
    nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
  });

  // Référence à la collection 'dishes' dans Firestore
  const dishesCollectionRef = collection(db, 'dishes');

  // Fonction pour charger les plats depuis Firebase
  const getDishes = async () => {
    try {
      const data = await getDocs(dishesCollectionRef);
      const fetchedDishes: Dish[] = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      })) as Dish[];
      setDishes(fetchedDishes);
    } catch (error) {
      console.error("Erreur lors de la récupération des plats :", error);
      toast.error("Erreur lors du chargement des plats.");
    }
  };

  // Charger les plats au montage du composant
  useEffect(() => {
    getDishes();
  }, []);

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || dish.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || dish.difficulty === selectedDifficulty;
    const matchesFavorites = !showFavoritesOnly || dish.isFavorite;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesFavorites;
  });

  // Fonction pour ajouter un plat à Firebase
  const handleAddDish = async () => {
    if (!newDish.name || !newDish.description) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    try {
      const dishToAdd: Omit<Dish, 'id'> = {
        ...newDish as Omit<Dish, 'id'>,
        isFavorite: false,
        approved: false,
        createdAt: new Date().toISOString().split('T')[0],
        ingredients: [], // Vous devrez ajouter la logique pour les ingrédients
        instructions: [], // Vous devrez ajouter la logique pour les instructions
        nutrition: newDish.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 }
      };

      await addDoc(dishesCollectionRef, dishToAdd);
      toast.success('Plat ajouté avec succès');
      setIsModalOpen(false);
      setNewDish({
        name: '',
        description: '',
        category: 'dejeuner',
        cookingTime: 30,
        servings: 4,
        difficulty: 'moyen',
        image: '',
        isVegetarian: false,
        isHalal: false,
        isGlutenFree: false,
        isSportFriendly: false,
        ingredients: [],
        instructions: [],
        nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 }
      });
      getDishes(); // Recharger les plats après l'ajout
    } catch (error) {
      console.error("Erreur lors de l'ajout du plat :", error);
      toast.error("Erreur lors de l'ajout du plat.");
    }
  };

  // Fonction pour basculer le statut favori d'un plat dans Firebase
  const toggleFavorite = async (dishId: string, currentFavoriteStatus: boolean) => {
    try {
      const dishDoc = doc(db, 'dishes', dishId);
      await updateDoc(dishDoc, { isFavorite: !currentFavoriteStatus });
      toast.success('Favoris mis à jour');
      getDishes(); // Recharger les plats après la mise à jour
    } catch (error) {
      console.error("Erreur lors de la mise à jour des favoris :", error);
      toast.error("Erreur lors de la mise à jour des favoris.");
    }
  };

  // Fonction pour supprimer un plat de Firebase
  const deleteDish = async (dishId: string) => {
    try {
      const dishDoc = doc(db, 'dishes', dishId);
      await deleteDoc(dishDoc);
      toast.success('Plat supprimé');
      getDishes(); // Recharger les plats après la suppression
    } catch (error) {
      console.error("Erreur lors de la suppression du plat :", error);
      toast.error("Erreur lors de la suppression du plat.");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      petit_dejeuner: 'Petit-déjeuner',
      dejeuner: 'Déjeuner',
      diner: 'Dîner'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      facile: 'bg-green-100 text-green-800',
      moyen: 'bg-yellow-100 text-yellow-800',
      difficile: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Plats</h1>
            <p className="text-gray-600">Gérez votre collection de recettes</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-5 h-5 mr-2" />
                Ajouter un plat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau plat</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom du plat *</Label>
                    <Input
                      id="name"
                      value={newDish.name || ''}
                      onChange={(e) => setNewDish({ ...newDish, name: e.target.value })}
                      placeholder="Ex: Salade César"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Catégorie *</Label>
                    <Select value={newDish.category} onValueChange={(value) => setNewDish({ ...newDish, category: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                        <SelectItem value="dejeuner">Déjeuner</SelectItem>
                        <SelectItem value="diner">Dîner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newDish.description || ''}
                    onChange={(e) => setNewDish({ ...newDish, description: e.target.value })}
                    placeholder="Décrivez votre plat..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cookingTime">Temps de cuisson (min)</Label>
                    <Input
                      id="cookingTime"
                      type="number"
                      value={newDish.cookingTime || 0}
                      onChange={(e) => setNewDish({ ...newDish, cookingTime: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="servings">Nombre de portions</Label>
                    <Input
                      id="servings"
                      type="number"
                      value={newDish.servings || 0}
                      onChange={(e) => setNewDish({ ...newDish, servings: Number(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulté</Label>
                    <Select value={newDish.difficulty} onValueChange={(value) => setNewDish({ ...newDish, difficulty: value as any })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Difficulté" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facile">Facile</SelectItem>
                        <SelectItem value="moyen">Moyen</SelectItem>
                        <SelectItem value="difficile">Difficile</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">URL de l'image</Label>
                  <Input
                    id="image"
                    value={newDish.image || ''}
                    onChange={(e) => setNewDish({ ...newDish, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Régimes alimentaires</Label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newDish.isVegetarian || false}
                        onChange={(e) => setNewDish({ ...newDish, isVegetarian: e.target.checked })}
                      />
                      <span>Végétarien</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newDish.isHalal || false}
                        onChange={(e) => setNewDish({ ...newDish, isHalal: e.target.checked })}
                      />
                      <span>Halal</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newDish.isGlutenFree || false}
                        onChange={(e) => setNewDish({ ...newDish, isGlutenFree: e.target.checked })}
                      />
                      <span>Sans gluten</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newDish.isSportFriendly || false}
                        onChange={(e) => setNewDish({ ...newDish, isSportFriendly: e.target.checked })}
                      />
                      <span>Sport</span>
                    </label>
                  </div>
                </div>

                {/* Section pour les ingrédients et instructions - à développer */}
                {/* Pour l'instant, ils sont vides lors de l'ajout */}
                <p className="text-sm text-gray-500">
                  La gestion des ingrédients et des instructions n'est pas encore implémentée dans ce formulaire d'ajout.
                  Vous devrez ajouter des champs pour cela et les sauvegarder dans Firebase.
                </p>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddDish}>
                    Ajouter le plat
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="petit_dejeuner">Petit-déjeuner</SelectItem>
                  <SelectItem value="dejeuner">Déjeuner</SelectItem>
                  <SelectItem value="diner">Dîner</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes difficultés</SelectItem>
                  <SelectItem value="facile">Facile</SelectItem>
                  <SelectItem value="moyen">Moyen</SelectItem>
                  <SelectItem value="difficile">Difficile</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favoris
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des plats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDishes.map((dish) => (
            <Card key={dish.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="aspect-video bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {dish.image ? (
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{dish.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(dish.id, dish.isFavorite)}
                    className="p-1"
                  >
                    <Heart className={`w-5 h-5 ${dish.isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dish.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="secondary">{getCategoryLabel(dish.category)}</Badge>
                  <Badge className={getDifficultyColor(dish.difficulty)}>
                    {dish.difficulty}
                  </Badge>
                  {!dish.approved && (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      En attente
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {dish.cookingTime} min
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {dish.servings} pers.
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {dish.isVegetarian && <Badge variant="outline" className="text-green-600">Végétarien</Badge>}
                  {dish.isHalal && <Badge variant="outline" className="text-blue-600">Halal</Badge>}
                  {dish.isGlutenFree && <Badge variant="outline" className="text-orange-600">Sans gluten</Badge>}
                  {dish.isSportFriendly && <Badge variant="outline" className="text-purple-600">Sport</Badge>}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{dish.nutrition.calories} cal</span>
                  </div>
                  <div className="flex space-x-2">
                    {/* Implémentez la logique d'édition ici */}
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteDish(dish.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDishes.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun plat trouvé</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all' || showFavoritesOnly
                  ? 'Aucun plat ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore ajouté de plats.'}
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-5 h-5 mr-2" />
                Ajouter votre premier plat
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MesPlats;
