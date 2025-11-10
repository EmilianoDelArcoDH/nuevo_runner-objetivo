import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../slices/themeSlice';
import SnakeGame from './SnakeGame';
import pythonLogo from '../assets/images/python-logo.png';
import './TopNavBar.css';
import { FaGlobe, FaDownload } from 'react-icons/fa'; 
import SnakeLoader from './SnakeLoader';
import PythonLoader from './PythonLoader';

const TopNavBar = ({
  setEditorFontSize,
  onRunCode,
  loadingPackages,
  addEditor,
  objetivoEjercicio,
  downloadCodes,
  saveEditors,
  restoreExercise,
  interruptExecution,
  loadingExecution,
  onFileUpload
}) => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  // Control del dropdown
  const [dropdownOpen, setDropdownOpen] = useState(null);

  // Control del popup "objetivo del ejercicio"
  const [showPopup, setShowPopup] = useState(false);

  // Control del sidebar de "nuevo archivo"
  const [showSidebar, setShowSidebar] = useState(false);
  const [fileName, setFileName] = useState('');

  // Control del sidebar de "subir archivo"
  const [showUploadSidebar, setShowUploadSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Control del "huevito de pascua" (snake game)
  const [clickCount, setClickCount] = useState(0);
  const [showSnakeGame, setShowSnakeGame] = useState(false);

  // Control del PythonLoader inicial
  const [showPythonLoader, setShowPythonLoader] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Tamaño de pantalla para responsive
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 800); 
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (initialLoad && loadingPackages) {
      setShowPythonLoader(true);
      const timer = setTimeout(() => {
        setShowPythonLoader(false);
        setInitialLoad(false);
      }, 3500); 
      return () => clearTimeout(timer);
    }
  }, []);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleLogoClick = () => {
    setClickCount((prevCount) => prevCount + 1);
  };

  useEffect(() => {
    if (clickCount === 5) {
      setShowSnakeGame(true);
      setClickCount(0);
    }
  }, [clickCount]);

  const toggleDropdown = (index) => {
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  const handleBackdropClick = (e) => {
    if (e.target.className.includes('popup-backdrop')) {
      setShowPopup(false);
    }
  };

  // ---- Sidebar "Nuevo archivo" ----
  const handleNewFile = () => {
    setShowSidebar(true);
  };

  const handleFileCreation = () => {
    if (fileName) {
      addEditor(fileName);
      setFileName('');
      setShowSidebar(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleFileCreation();
    }
  };

  // ---- Sidebar "Subir archivo" ----
  const handleUploadFile = () => {
    // Muestra el sidebar para subir archivo
    setShowUploadSidebar(true);
  };

  const handleFileInputChange = (e) => {
    // Captura el archivo seleccionado
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileContent = event.target.result;
        // Llamamos a la función onFileUpload para enviar los datos al componente padre
        onFileUpload({
          id: selectedFile.name,  // Usamos el nombre del archivo como identificador
          code: fileContent       // El contenido del archivo
        });
        // Limpieza de estados tras la subida
        setSelectedFile(null);
        setShowUploadSidebar(false);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleCancelUpload = () => {
    // Restablece estado y cierra el sidebar
    setSelectedFile(null);
    setShowUploadSidebar(false);
  };

  // ---- Manejo del tamaño de fuente en el editor ----
  const handleFontSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setEditorFontSize(newSize);
  };

  return (
    <>
      <header className={`topNavBar ${mode}`}>
        <div className="logo" onClick={handleLogoClick}>
          <img src={pythonLogo} alt="Python Logo" className="logo-icon" />
          <span className={`logo-text ${mode}`}>Python</span>
        </div>

        <nav className="navLinks">
          <div className="navItem" onClick={() => toggleDropdown(1)}>
            {t('file')}
            {dropdownOpen === 1 && (
              <div className="dropdown">
                <a onClick={handleNewFile}>{t('newFile')}</a>
                {/* Aquí llamamos a la función handleUploadFile */}
                <a onClick={handleUploadFile}>{t('uploadFile')}</a>
                <a onClick={() => restoreExercise()}>{t('restoreOriginal')}</a>
                <a onClick={() => saveEditors()}>{t('save')}</a>
              </div>
            )}
          </div>
          <div className="fontSizeControl">
            <label htmlFor="fontSizeSelect">{t('fontSize')}:</label>
            <select id="fontSizeSelect" onChange={handleFontSizeChange} defaultValue="14">
              <option value="10">10</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
              <option value="20">20</option>
              <option value="24">24</option>
              <option value="28">28</option>
              <option value="32">32</option>
            </select>
          </div>
          <div
            className={`navItem ${loadingPackages ? "disabled" : ""}`}
            onClick={!loadingPackages && !loadingExecution ? onRunCode : null}
          >
            {loadingPackages && showPythonLoader && <PythonLoader />}
            {loadingPackages && <SnakeLoader />}
            {!loadingPackages && !loadingExecution && (
              <span>
                <i className="fas fa-play"></i>
                {!isSmallScreen && ` ${t("run")}`}
              </span>
            )}
          </div>
          {loadingExecution && (
            <>
              <div className="navItemSnake">
                <SnakeLoader />
              </div>
              <div className="navItem" onClick={interruptExecution}>
                <span>
                  <i className="fas fa-square"></i>
                  {!isSmallScreen && ` ${t("interruptExecution")}`}
                </span>
              </div>
            </>
          )}
        </nav>

        <div className="actions">
          <button className="actionButton" onClick={downloadCodes}>
            {isSmallScreen ? <FaDownload /> : t("downloadCode")}
          </button>
          {/* Si deseas mostrar el popup con el objetivo del ejercicio, descomenta esta sección
          <button className="actionButton" onClick={togglePopup}>
            {t('exerciseObjective')}
          </button> 
          */}
          <div className="languageSwitcher">
            <button className="actionButton">
              <FaGlobe className="globeIcon"/>
              <select
                id="languageSelect"
                onChange={(e) => changeLanguage(e.target.value)}
                value={i18n.language}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
              </select>
            </button>
          </div>
          <button className="actionButton themeToggleButton" onClick={handleThemeToggle}>
            <span className="themeIcon">
              <i className="fas fa-moon"></i>
            </span>
          </button>
        </div>
      </header>

      {/* Juego de la serpiente */}
      {showSnakeGame && <SnakeGame onClose={() => setShowSnakeGame(false)} />}

      {/* Sidebar "Nuevo archivo" */}
      {showSidebar && (
        <div className={`sidebar ${mode}`}>
          <h3>{t('createNewFile')}</h3>
          <input
            type="text"
            placeholder={t('enterFileName')}
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleFileCreation}>{t('create')}</button>
          <button onClick={() => setShowSidebar(false)}>{t('cancel')}</button>
        </div>
      )}

      {/* Sidebar "Subir archivo" */}
      {showUploadSidebar && (
        <div className={`sidebar ${mode}`}>
          <h3>{t('uploadFile')}</h3>
          <input
            type="file"
            onChange={handleFileInputChange}
          />
          <button onClick={handleFileUpload}>{t('uploadFile')}</button>
          <button onClick={handleCancelUpload}>{t('cancel')}</button>
        </div>
      )}

      {/* Popup "Objetivo del ejercicio" */}
      {showPopup && (
        <div className="popup-backdrop" onClick={handleBackdropClick}>
          <div className={`popup-content ${mode}`}>
            <button className="close-btn" onClick={togglePopup}>×</button>
            <h2>{t('exerciseObjective')}</h2>
            <p>{objetivoEjercicio ? objetivoEjercicio : t('noObjective')}</p>
          </div>
        </div>
      )}
    </>
  );
};

export default TopNavBar;
