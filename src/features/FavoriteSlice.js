// src/features/FavoriteSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: [], // 🔧 un tableau initialisé correctement
};

const favoriteSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    addFavorite: (state, action) => {
      state.value.push(action.payload); // ✅ fonctionne car `value` est un tableau
    },
    removeFavorite: (state, action) => {
      state.value = state.value.filter(
        item => item.id !== action.payload.id
      );
    },
  },
});

export const { addFavorite, removeFavorite } = favoriteSlice.actions;
export default favoriteSlice.reducer;