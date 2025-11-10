import React from 'react';
import './TerminalLoader.css';

const TerminalLoader = () => {
  return (
    <div className="snake-container">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="-8 -8 64 84" shapeRendering="crispEdges">
        <defs>
            <pattern id="pattern" width="8" height="8" patternUnits="userSpaceOnUse" x="-4" y="-4">
            <path d="M 0 0 L8 0 8 8 0 8 z" fill="none"></path>
            </pattern>
        </defs>
        <g className="snake-group" strokeLinejoin="miter" strokeLinecap="square" strokeWidth="8" fill="none">
            <path className="dot dot-1" d="M28,48 l8,0z" />
            <path className="dot dot-2" d="M-4,48 l8,0z" />
            <path className="dot dot-3" d="M4,16 l8,0z" />
            <path className="snake" d="M0 16 h48 v16 H32 v32 H0 V48 h16 V0 H0 v16"/>
        </g>
        <rect x="-4.5" y="-4.5" width="57" height="73" fill="url(#pattern)"></rect>
        </svg>
    </div>
  );
};

export default TerminalLoader;
