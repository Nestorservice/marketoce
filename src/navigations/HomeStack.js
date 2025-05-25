// src/navigation/HomeStack.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import Consulter_stock from '../screens/Consulter_stock';
import Liste_course from '../screens/Liste_course';
import Consommation from '../screens/Consommation.js';
import Produits_expirer from '../screens/Produits_expirer';
import Historique from '../screens/Historique';

const Stack = createNativeStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="Consulter_stock" component={Consulter_stock} />
      <Stack.Screen name="Liste_course" component={Liste_course} />
      <Stack.Screen name="Consommation" component={Consommation} />
      <Stack.Screen name="Produits_expirer" component={Produits_expirer} />
      <Stack.Screen name="Historique" component={Historique} />
    </Stack.Navigator>
  );
}
