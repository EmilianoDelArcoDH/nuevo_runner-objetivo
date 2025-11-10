import React, { useEffect, useRef } from 'react';
import './TerminalOutput.css';

const TerminalOutput = ({ history, inputPrompt, mode, onInputSubmit, waitingForInput }) => {
  const [currentInput, setCurrentInput] = React.useState('');
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history, currentInput, waitingForInput]); // Añadido waitingForInput aquí

  useEffect(() => {
    if (waitingForInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [waitingForInput]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentInput.trim()) {
        onInputSubmit(currentInput);
        inputPrompt.push(`>>> ${currentInput}`);
        setCurrentInput('');
      }
    }
  };

  return (
    <div className={`output-container ${mode}`}>
      <pre className={`output ${mode}`} ref={outputRef}>
        {
          waitingForInput === false ? (
            <>
              {history.map((entry, index) => (
                <div key={index}>
                  {entry}
                  {index < history.length - 1 && <hr />}
                </div>
              ))}
            </>
          ) : (
            inputPrompt.map((entry, index) => (
              <div key={index}>
                {entry}
              </div>
            ))
          )
        }
      </pre>
      {waitingForInput && (
        <div className="input-container">
          <span className="prompt">user@machine:~$</span>
          <textarea
            ref={inputRef}
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="input-box"
            placeholder=""
          />
        </div>
      )}
    </div>
  );
};

export default TerminalOutput;
