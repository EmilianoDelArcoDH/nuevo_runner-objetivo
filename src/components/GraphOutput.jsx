import React from 'react';
import './GraphOutput.css';
import { useTranslation } from 'react-i18next';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const GraphOutput = ({ graphs, mode }) => {
  const { t } = useTranslation(); // Hook para traducciones
  const isDarkMode = mode === 'dark'; // Determina si el modo es oscuro

  return (
    <div className={`chart-container ${isDarkMode ? 'dark' : 'light'}`}>
      {graphs && graphs.length > 0 ? (
        graphs.map((graphBase64, index) => (
          <React.Fragment key={index}>
            <Zoom>
              <img
                src={`data:image/png;base64,${graphBase64}`}
                alt={`Generated Graph ${index + 1}`}
                className="graph-image"
              />
            </Zoom>
            {/* Muestra el separador salvo después del último gráfico */}
            {index !== graphs.length - 1 && <div className="separator">-----</div>}
          </React.Fragment>
        ))
      ) : (
        <p>{t('graphText')}</p> // Mensaje cuando no hay gráficos
      )}
    </div>
  );
};

export default GraphOutput;
