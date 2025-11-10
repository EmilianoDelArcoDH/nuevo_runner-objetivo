// src/components/Exercise.js

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Importar useParams
import { Layout, Model, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { layoutModelJson } from '../utils/layoutModelJson';
import { useTranslation } from 'react-i18next';
import { exercises } from '../utils/exercises';
import { usePgEvent } from '../hooks/usePgEvent';
import { useValidateExercise } from '../hooks/useValidateExercise.jsx';
import useFlexLayoutTheme from '../hooks/useFlexLayoutTheme';
import TopNavBar from '../components/TopNavBar';
import NavigationComponent from '../components/NavigationComponent';
import Editor from '../components/Editor';
import TerminalOutput from '../components/TerminalOutput';
import usePyodide from '../hooks/usePyodide';
import terminalIcon from '../assets/images/terminal.svg';
import DecisionTreeOutput from '../components/DecisionTreeOutput';
import folderIcon from '../assets/images/folder.svg';
import GraphOutput from '../components/GraphOutput';
import './Sandbox.css';
import 'flexlayout-react/style/light.css';
import BorderRight from '../components/BorderRight.jsx';
import { result } from 'lodash';

const Exercise = () => {
  const { t, i18n } = useTranslation();
  const { exerciseId, lang } = useParams();
  const { 
    runPythonCode,
    provideInput,
    interruptExecution,
    setEditors,
    initializeWorker,
    setOutputPyodideHistory, 
    setOutputPyodideGraph,
    setOutputDecisionTree,
    setCsvFileData, 
    csvFileData,
    loadingPackages,
    outputPyodideHistory,
    outputPyodideGraph,
    outputDecisionTreeGraph,
    waitingForInput,
    loadingExecution,
    outputPyodideInput,
    editors,
  } = usePyodide();
  const { postEvent, waitForMessage } = usePgEvent(); 
  const [fontSize, setFontSize] = useState(null); // Manejo de tamaño de fuente
  const [files, setFiles] = useState([]); // Archivos cerrados
  const layoutRef = useRef(null); // Ref del layout
  const mode = useSelector((state) => state.theme.mode);   // Selector de tema
  const modelJson = useMemo(() => layoutModelJson(terminalIcon, folderIcon, t), [t]);  // Importando y creando el modelo del alyout
  const model = useMemo(() => Model.fromJson(modelJson), [modelJson]);
  const exercise = exercises.find((ex) => ex.id === exerciseId);  // Obtener el exercise correspondiente por parametro
  useFlexLayoutTheme(mode);  // Cambiar el tema de flex layout
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);  // Estado para verificar si el worker ya ha sido inicializado
  const [eventType, setEventType] = useState(null)
  // Actualizar lenguaje por parametro
  useEffect(() => {
    i18n.changeLanguage(lang);
  }, [lang, i18n]);

  useEffect(() => {
    // Inicializar el worker solo una vez al cargar el componente
    if (!isWorkerInitialized && exercise.packages) {
      initializeWorker(exercise.packages);
      setIsWorkerInitialized(true); // Marcar que el worker ya ha sido inicializado
    }
  }, [initializeWorker, exercise, isWorkerInitialized]);
  
  useEffect(() => {

    if (!loadingExecution) {
      const stateToPost = editors.map(editor => ({
        id: editor.id,
        code: editor.code,
      }));
      
      useValidateExercise(exerciseId, editors, lang, postEvent, stateToPost);
    }

  }, [loadingExecution]);

  // ---- NUEVO: cada vez que csvFileData cambie, creamos el "archivo" CSV en Sandbox
  useEffect(() => {
    if (csvFileData) {
      const newId = csvFileData.fileName;
      
      // Verifica si el id ya existe en files o en editors
      const existsInFiles = files.some(file => file.id === newId);
      const existsInEditors = editors.some(editor => editor.id === newId);
      
      if (existsInFiles || existsInEditors) {
        // Si ya existe, simplemente limpia el csvFileData y no hace nada más.
        setCsvFileData(null);
        return;
      }
      
      const fileData = { id: newId, code: csvFileData.code };
      
      // Agrega a ambos arrays
      setFiles(prev => [...prev, fileData]);
      setEditors(prev => [...prev, fileData]);
      
      // Crea la pestaña correspondiente
      if (layoutRef.current) {
        layoutRef.current.addTabToTabSet('#3a8361ce-881c-44d6-827c-487d1fcdb066', {
          type: 'tab',
          component: 'EditorComponent',
          id: fileData.id,
          name: fileData.id,
          enableClose: true,
        });
      }
      
      // Limpia el estado para evitar ciclos
      setCsvFileData(null);
    }
  }, [csvFileData, files, editors, setCsvFileData, setEditors, setFiles]);
  

  // Efecto para actualizar los layouts de editores cuando cambia el lenguaje
  useEffect(() => {
    editors.forEach(editor => {
      layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
        type: "tab",
        component: "EditorComponent",
        id: editor.id, 
        name: editor.id, 
        enableClose: true,
      });
    })
  }, [t]) 

  // Crear el primer editor automáticamente al iniciar la app
  useEffect(() => {
    const loadEditors = async () => {
      const rawData = await waitForMessage();
      // console.log(rawData);
      
      let data;
      try {
        data = JSON.parse(rawData);

        console.log("La data parseada es: ", data);
      } catch (error) {
        console.error("Error al hacer JSON.parse de los datos:", error);
        return;
      }
    
      if (data && Array.isArray(data.data)) {
    
        // Accedemos al array dentro de "data"
        const editorsData = data.data;
      
        // Si recibimos datos, cargamos los editores con la información
        // console.log(data.data);
        setEventType(data.eventType)
        setEditors(editorsData.map(editor => ({ id: editor.id, code: editor.code })));
        setFiles(editorsData.map(file => ({ id: file.id, code: file.code })));
        
        // Agregar pestañas para los editores cargados
        editorsData.forEach(editor => {
          if (layoutRef.current) {
            layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
              type: "tab",
              component: "EditorComponent",
              id: editor.id, 
              name: editor.id,
              enableClose: true,
            });
          }
        });
      } else {
        // Si no se recibe nada, inicializar como antes
        if (layoutRef.current) {
          if (exercise) {
            // Iterar sobre los editores y crear pestañas basadas en sus IDs
            Object.entries(exercise.editors).forEach(([key, editor]) => {
              ////console.log(editor);
              layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
                type: "tab",
                component: "EditorComponent",
                id: key,
                name: key, 
                enableClose: true,
              });
    
              setEditors(prevEditors => [
                ...prevEditors,
                { id: key, code: editor.code[lang], readOnly: editor.isReadOnly }
              ]);
              setFiles(prevFiles => [
                ...prevFiles,
                { id: key, code: editor.code[lang]}
              ])
            });
          }
        }
      }
    };

    loadEditors();
  }, []);

  // Funcion para descargar el codigo
  const downloadCodes = () => {
    editors.forEach(editor => {
      // Crear un Blob para cada código del editor
      const blob = new Blob([editor.code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      // Asignar el nombre del archivo basado en el ID del editor
      a.href = url;
      a.download = `${editor.id}.py`; // Cambia la extensión según sea necesario

      // Simular un clic para iniciar la descarga
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Limpiar la URL creada
      URL.revokeObjectURL(url);
    });
  };

  // Función para manejar los cambios en el contenido de un editor específico
  const handleCodeChange = (id, newCode) => {

    // setEventType(null);
    // if (window.mostrarResultadoHTML) window.mostrarResultadoHTML("");
    setEditors((prevEditors) =>
      prevEditors.map((editor) => 
        editor.id === id ? { ...editor, code: newCode } : editor
      )
    );
  };


  // Combinar el código de todos los editores y ejecutarlo
  const handleRunCode = async () => {
    // setEventType(null);
    // if (window.mostrarResultadoHTML) window.mostrarResultadoHTML("");

    await runPythonCode(editors, exercise.data, exercise.editorsNotVisible || {}, mode);

    // Crear el objeto de estado de los editores para enviarlo
    const stateToPost = editors.map(editor => ({
        id: editor.id,
        code: editor.code
    }));

    postEvent("STATE", "Guardando estado de los editores", [], stateToPost);

  };


  const saveEditors = () => {
    const stateToPost = editors.map(editor => ({
      id: editor.id,
      code: editor.code
    }));

    postEvent("STATE", "Guardando estado de los editores", [], stateToPost);
  }

  // Restablecer ejercicio a formato original
  const restoreExercise = () => {

    // Loop through each file ID and delete it using deleteFile function
    files.forEach(file => deleteFile(file.id));
  
    // Clear the current editors and files
    setEditors([]);
    setFiles([]);
    setOutputPyodideGraph([]);
    setOutputDecisionTree([]);
    setOutputPyodideHistory([]);

    setEventType("FAILURE"); // o "FAILURE", cualquier cosa que NO sea "SUCCESS"
    if (window.mostrarResultadoHTML) window.mostrarResultadoHTML("");

    if (exercise) {
      // Iterar sobre los editores y crear pestañas basadas en sus IDs
      Object.entries(exercise.editors).forEach(([key, editor]) => {
        ////console.log(editor);
        layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
          type: "tab",
          component: "EditorComponent",
          id: key,
          name: key, 
          enableClose: true,
        });

        setEditors(prevEditors => [
          ...prevEditors,
          { id: key, code: editor.code[lang], readOnly: editor.isReadOnly }
        ]);
        setFiles(prevFiles => [
          ...prevFiles,
          { id: key, code: editor.code[lang]}
        ])
      });
    }
  
    // Post a failure event if necessary
    postEvent("FAILURE", "Se ha reseteado el ejercicio", [], "");
  };

  // Función para manejar la subida del archivo
  const handleFileUpload = (fileData) => {
    const newId = fileData.id;
  
    // Verifica si el id ya existe en alguno de los arrays
    const existsInFiles = files.some(file => file.id === newId);
    const existsInEditors = editors.some(editor => editor.id === newId);
  
    if (existsInFiles || existsInEditors) {
      // Si el id ya existe, no se agrega el archivo y se puede mostrar un mensaje o simplemente retornar.
      return;
    }
  
    // Agregar el archivo al estado files
    setFiles(prevFiles => [...prevFiles, fileData]);
  
    // (Opcional) Agregar el archivo también a los editores
    setEditors(prevEditors => [...prevEditors, fileData]);
  
    // (Opcional) Agregar una nueva pestaña en el layout para este archivo
    if (layoutRef.current) {
      layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
        type: "tab",
        component: "EditorComponent",
        id: fileData.id,
        name: fileData.id,
        enableClose: true,
      });
    }
  };

  // Creando los layouts 
  const factory = useCallback((node) => {
    const component = node.getComponent();
    switch (component) {
      case 'EditorComponent': {
        const editorId = node.getName();
        const editorData = editors?.find((editor) => editor.id === editorId);
        // Si no existe editorData, cierra la pestaña y no renderiza nada
        if (!editorData) {
          if (model) {
            model.doAction(Actions.deleteTab(node.getId()));
          }
          return null;
        }
      
        return (
          <Editor
            value={editorData ? editorData.code : ''}
            onChange={(newCode) => handleCodeChange(editorId, newCode)}
            mode={mode}
            readOnly={editorData.readOnly ?? false}
            fontSize={fontSize}
          />
        );
      }      
      case 'TerminalOutputComponent':
        return (
          <TerminalOutput
            onInputSubmit={provideInput}
            history={outputPyodideHistory} // Pasar el historial
            inputPrompt={outputPyodideInput}
            waitingForInput={waitingForInput}
            mode={mode}   
          />
        );
      case 'GraphOutputComponent':
        return (
          <GraphOutput 
            graphs={outputPyodideGraph} 
            mode={mode}
          />
        );
      case 'DecisionTreeOutputComponent':
        return (
          <DecisionTreeOutput 
            treeDot={outputDecisionTreeGraph} 
            mode={mode}   
          />
        );
      case 'NavigationComponent': 
        return (
          <NavigationComponent 
            files={files} 
            restoreFile={restoreFile} 
            mode={mode}
            deleteFile={deleteFile}
          />
        );
      case 'OptionsComponent':
        return (
          <BorderRight
            mode={mode}
            lang={lang}
            eventTypePG={eventType}
          />
        );
      default:
        return <div>Componente no definido: {component}</div>;
    }
  }, [handleRunCode, provideInput, editors, outputPyodideHistory, waitingForInput, mode, fontSize]);

  // Función para restaurar un archivo cerrado
  const restoreFile = useCallback((file) => {

    if (model) {
      // Check if the file already exists in the layout by its ID
      const tabNode = model.getNodeById(file.id);
      
      //console.log(tabNode);

      // If the file does not exist, add it to the layout
      if (!tabNode) {
        layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
          type: "tab",
          component: "EditorComponent",
          id: file.id,
          name: file.id,
          enableClose: true,
        });
      }
    }
  }, [model, layoutRef]);
  
  // Funcion para eliminar tabs
  const deleteFile = useCallback((fileName) => {
    if (model) {
      // Locate the tab node by its file name (assuming fileName is the ID)
      const tabNode = model.getNodeById(fileName);
      //console.log(tabNode);
      if (tabNode) {
        // Use deleteTab action to remove the tab from the layout
        model.doAction(Actions.deleteTab(tabNode.getId()));
      }
    }
  
    // Update 'files' and 'editors' state to remove the file and editor entries
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileName));
    setEditors((prevEditors) => prevEditors.filter((editor) => editor.id !== fileName));
  }, [model, setEditors, setFiles]);

  // Función para añadir un nuevo editor con un nombre personalizado
  const addEditor = useCallback((nombreEditor) => {
    // Verificar si ya existe un editor con el mismo nombre
    const editorExistente = editors.some(editor => editor.id === nombreEditor);

    if (editorExistente) {
      // Si ya existe, mostrar un mensaje o realizar alguna acción
      console.warn(`Ya existe un editor con el nombre "${nombreEditor}".`);
      return; // Salir de la función para evitar agregar duplicados
    }

    if (layoutRef.current) {
      layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
        type: "tab",
        component: "EditorComponent",
        name: nombreEditor,
        enableClose: true, // Permitir cerrar para nuevos editores
      });

      setEditors([...editors, { id: nombreEditor, code: '' }]);
      setFiles((prevFiles) => [...prevFiles, { id: nombreEditor, code: '' }]);
    }
  }, [editors]);


  return (
    <div className={`sandbox-container ${mode}`}>
      <TopNavBar 
        onRunCode={handleRunCode} 
        addEditor={addEditor} 
        downloadCodes={downloadCodes} 
        saveEditors={saveEditors} 
        interruptExecution={interruptExecution} 
        restoreExercise={restoreExercise} 
        setEditorFontSize={setFontSize} 
        loadingPackages={loadingPackages} 
        objetivoEjercicio={exercise.prompt} 
        loadingExecution={loadingExecution} 
        defaultLanguage={lang}
        onFileUpload={handleFileUpload}
      />
      <div className="flexlayout-wrapper">
        <Layout 
          factory={factory} 
          ref={layoutRef} 
          model={model} 
          className="flexlayout-container" 
        />
      </div>
    </div>
  );

};

export default Exercise;