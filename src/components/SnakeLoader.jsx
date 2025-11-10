import React from 'react';
import './SnakeLoader.css';

const SnakeLoader = () => {
  return (
    <div className="snake">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className={`snake__box-${i}`}></div>
      ))}
    </div>
  );
};

export default SnakeLoader;
