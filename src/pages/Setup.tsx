
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ChefHat, Users, Target, Utensils } from 'lucide-react';
import { toast } from 'sonner';

const Setup: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    age: '',
    gender: '',
    dietPreference: '',
    householdSize: '1'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.gender || !formData.dietPreference) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Update user profile with setup completion
    updateUserProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      isSetupComplete: true
    });
    
    toast.success('Configuration terminée avec succès !');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configuration de votre profil
          </CardTitle>
          <p className="text-gray-600">
            Aidez-nous à personnaliser votre expérience SmartMeal
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Informations personnelles</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    placeholder="Votre prénom"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    placeholder="Votre nom"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Âge *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    placeholder="Votre âge"
                    min="1"
                    max="120"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="gender">Genre *</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner votre genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homme">Homme</SelectItem>
                      <SelectItem value="femme">Femme</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Préférences alimentaires */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Préférences alimentaires</h3>
              </div>
              
              <div>
                <Label htmlFor="dietPreference">Régime alimentaire *</Label>
                <Select value={formData.dietPreference} onValueChange={(value) => setFormData({...formData, dietPreference: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner votre régime" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="vegetarien">Végétarien</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                    <SelectItem value="sans_gluten">Sans gluten</SelectItem>
                    <SelectItem value="sportif">Sportif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Composition du foyer */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Utensils className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold">Composition du foyer</h3>
              </div>
              
              <div>
                <Label htmlFor="householdSize">Nombre de personnes</Label>
                <Select value={formData.householdSize} onValueChange={(value) => setFormData({...formData, householdSize: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8,9,10].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} personne{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              Terminer la configuration
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Setup;
