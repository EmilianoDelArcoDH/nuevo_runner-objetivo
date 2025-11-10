// BorderRight.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BorderRight.css';

const STRINGS = {
  es: {
    title: "💡 Feedback generado por la IA",
    empty: "No hay feedback generado aún.",
    success: '✅ Este ejercicio se resolvió de manera exitosa. Para volver a realizarlo presioná "Archivo ➡ Restaurar Original".',
  },
  en: {
    title: "💡 AI-generated Feedback",
    empty: "No feedback generated yet.",
    success: '✅ This exercise was completed successfully. To try again, click "File ➡ Restore Original".',
  },
  pt: {
    title: "💡 Feedback gerado pela IA",
    empty: "Nenhum feedback gerado ainda.",
    success: '✅ Este exercício foi concluído com sucesso. Para refazê-lo, clique em "Arquivo ➡ Restaurar Original".',
  },
};

const BorderRight = ({ mode, lang, eventTypePG}) => {
  const themeClass = mode === 'dark' ? 'dark-mode' : 'light-mode';
  // console.log(`BorderRight render - mode: ${mode}, lang: ${lang}`);
  
  const L = STRINGS[lang] || STRINGS.es;
  // console.log(eventTypePG);
  
  const [iaMessages, setIaMessages] = useState("");

  useEffect(() => {
    // Reemplaza la función global con versión que actualiza el estado
    window.mostrarResultadoHTML = (html) => {
      setIaMessages(html);
    };
  }, []);

  const contentHTML =
    eventTypePG === 'SUCCESS'
      ? `<div class="ia-success">${L.success}</div>`
      : (iaMessages || L.empty);

  return (
    <div className={`border-right-container ${themeClass}`} lang={lang}>
      <div className="ia-panel">
        <h2 className="ia-title">{L.title}</h2>
        <div
          id="iaResult"
          className="ia-result"
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
      </div>
    </div>
  );
};

BorderRight.propTypes = {
  mode: PropTypes.oneOf(['light', 'dark']).isRequired,
  lang: PropTypes.oneOf(['es', 'en', 'pt']),
};

export default BorderRight;
