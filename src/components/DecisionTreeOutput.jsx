import React, { useState, useEffect } from 'react';
import './DecisionTreeOutput.css';
import { useTranslation } from 'react-i18next';
import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';

const DecisionTreeOutput = ({ treeDot, mode }) => {
  const { t } = useTranslation();
  const isDarkMode = mode === 'dark';
  const [svgs, setSvgs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (treeDot && treeDot.length > 0) {
      const viz = new Viz({ Module, render });
      Promise.all(
        treeDot.map(dotString => viz.renderSVGElement(dotString))
      )
        .then(elements => {
          setSvgs(elements.map(element => element.outerHTML));
        })
        .catch(err => {
          console.error(err);
          setError(err);
        });
    }
  }, [treeDot]);

  return (
    <div className={`chart-container ${isDarkMode ? 'dark' : 'light'}`}>
      {error && <p>{t('errorGraph')}</p>}
      {(!treeDot || treeDot.length === 0) ? (
        <p>{t('graphText')}</p>
      ) : svgs.length === 0 ? (
        <p>{t('loadingGraph')}</p>
      ) : (
        svgs.map((svg, index) => (
          <div key={index} className="graph-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        ))
      )}
    </div>
  );
};

export default DecisionTreeOutput;
