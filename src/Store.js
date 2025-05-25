// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore , persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import FavoritesReducer from './features/FavoriteSlice';
//import { getDefaultConfig } from '@react-native/metro-config';
//import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
//import persistReducer from 'redux-persist/es/persistReducer';


const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
};

const rootReducer = combineReducers({
  favorites: FavoritesReducer,
});

const persistedReducer = persistReducer(persistConfig , rootReducer);

export const Store = configureStore({
  reducer: persistedReducer,
  middleware : getDefaultMiddleware => 
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  });

export const persistor = persistStore(Store);
