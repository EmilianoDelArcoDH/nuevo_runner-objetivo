import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import languageReducer from '../slices/languageSlice';
import dataReducer from '../slices/dataSlice';
import themeReducer from '../slices/themeSlice'; // Import the theme slice

const store = configureStore({
  reducer: {
    language: languageReducer,
    data: dataReducer,
    theme: themeReducer, // Add the theme reducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
