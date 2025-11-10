// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import Home from './pages/Home'; // Importamos la página Home
import Exercise from './pages/Exercise';
import Sandbox from './pages/Sandbox';
import NotFound from './pages/NotFound'; // Página de error 404

function ExerciseWrapper() {
  const { exerciseId, lang } = useParams();

  // Redirige a 'es' si no se proporciona lang
  if (!lang) {
    return <Navigate to={`/exercise/${exerciseId}/es`} replace />;
  }
  
  return <Exercise />;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta para el Home */}
        <Route path="/" element={<Home />} />
        {/* Ruta para los ejercicios */}
        <Route path="/exercise/:exerciseId" element={<ExerciseWrapper />} />
        <Route path="/exercise/:exerciseId/:lang" element={<ExerciseWrapper />} />
        {/* Ruta para el sandbox */}
        <Route path="/sandbox" element={<Sandbox />} />
        {/* Ruta para manejar páginas no encontradas */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
