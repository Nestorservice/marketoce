import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
//import * as ImagePicker from 'expo-image-picker';
//import { Alert } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import Consulter_stock from '../screens/Consulter_stock';
import Liste_course from '../screens/Liste_course';
import Consommation from '../screens/Consommation';
import Produits_expirer from '../screens/Produits_expirer';
import Choix from '../screens/Choix';
import Moi from '../screens/Moi';
import Historique from '../screens/Historique';
import Ajouter_plat from '../screens/Ajouter_plat';
import Famille from '../screens/Famille';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="Famille" component={Famille} />
      <HomeStack.Screen name="Consulter_stock" component={Consulter_stock} />
      <HomeStack.Screen name="Liste_course" component={Liste_course} />
      <HomeStack.Screen name="Consommation" component={Consommation} />
      <HomeStack.Screen name="Produits_expirer" component={Produits_expirer} />
      <HomeStack.Screen name="Historique" component={Historique} />
    </HomeStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Choix') {
            iconName = focused ? 'options' : 'options-outline';
          } else if (route.name === 'Historique') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Moi') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'green',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ headerShown: false, title: 'Home' }} />
      <Tab.Screen name="Choix" component={Choix} />
      <Tab.Screen name="Historique" component={Historique} />
      <Tab.Screen name="Moi" component={Moi} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <RootStack.Screen name="Ajouter_plat" component={Ajouter_plat} options={{ title: 'Ajouter un plat' }} />
    </RootStack.Navigator>
  );
}
