// src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage } from '../slices/languageSlice';
import { exercises } from '../utils/exercises';
import './Home.css';

const Home = () => {
  const dispatch = useDispatch();
  const currentLanguage = useSelector((state) => state.language.currentLanguage);

  const handleChangeLanguage = (event) => {
    dispatch(setLanguage(event.target.value));
  };

  return (
    <div className="home-container">
      <h1>Bienvenido a la plataforma de ejercicios y sandbox</h1>
      <ul className="exercise-list">
        <li>
          <Link to="/sandbox">Ir al Sandbox</Link>
        </li>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <Link to={`/exercise/${exercise.id}`}>Ejercicio {exercise.id}</Link>
          </li>
        ))}
      </ul>
      <p>Current Language: {currentLanguage}</p>
      <label htmlFor="language">Select Language:</label>
      <select id="language" value={currentLanguage} onChange={handleChangeLanguage}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
};

export default Home;
