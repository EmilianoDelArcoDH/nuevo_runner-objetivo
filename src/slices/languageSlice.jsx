import { createSlice } from '@reduxjs/toolkit';

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    currentLanguage: 'en',
    availableLanguages: ['en', 'es', 'fr'],
  },
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    addLanguage: (state, action) => {
      state.availableLanguages.push(action.payload);
    },
  },
});

export const { setLanguage, addLanguage } = languageSlice.actions;

export default languageSlice.reducer;
