import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Layout, Model, Actions } from 'flexlayout-react';
import { useSelector } from 'react-redux';
import { layoutModelJson } from '../utils/layoutModelJson';
import { useTranslation } from 'react-i18next';
import { usePgEvent } from '../hooks/usePgEvent';
import useFlexLayoutTheme from '../hooks/useFlexLayoutTheme';
// import BlocklyComponent from '../blockly/BlocklyComponent';
import TopNavBar from '../components/TopNavBar';
import Editor from '../components/Editor';
import TerminalOutput from '../components/TerminalOutput';
import usePyodide from '../hooks/usePyodide';
import terminalIcon from '../assets/images/terminal.svg';
import folderIcon from '../assets/images/folder.svg';
import DecisionTreeOutput from '../components/DecisionTreeOutput';
import GraphOutput from '../components/GraphOutput';
import NavigationComponent from '../components/NavigationComponent';
import './Sandbox.css';
import 'flexlayout-react/style/light.css';
import BorderRight from '../components/BorderRight';


const Sandbox = () => {
  const { t } = useTranslation();
  const { 
    runPythonCode, 
    initializeWorker, 
    setOutputPyodideHistory, 
    setOutputPyodideGraph,
    setOutputDecisionTree,
    setEditors, 
    interruptExecution, 
    provideInput,
    setCsvFileData, 
    csvFileData,
    loadingPackages, 
    outputPyodideHistory, 
    outputPyodideGraph, 
    outputDecisionTreeGraph,
    waitingForInput, 
    editors, 
    loadingExecution, 
    outputPyodideInput, 
  } = usePyodide();
  const { postEvent, waitForMessage } = usePgEvent();
  const [files, setFiles] = useState([]); // Archivos cerrados
  const [fontSize, setFontSize] = useState(null);
  const layoutRef = useRef(null);
  const mode = useSelector((state) => state.theme.mode);
  const modelJson = useMemo(() => layoutModelJson(terminalIcon, folderIcon, t), [t]);
  const model = useMemo(() => Model.fromJson(modelJson), [modelJson]);
  useFlexLayoutTheme(mode);

  // Estado para verificar si el worker ya ha sido inicializado
  const [isWorkerInitialized, setIsWorkerInitialized] = useState(false);

  useEffect(() => {
    // Inicializar el worker solo una vez al cargar el componente
    if (!isWorkerInitialized) {
      initializeWorker(['pandas', 'numpy', 'matplotlib', 'scipy', 'micropip']);
      setIsWorkerInitialized(true); // Marcar que el worker ya ha sido inicializado
    }
  }, [initializeWorker, isWorkerInitialized]);

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
  

  // Crear el primer editor automáticamente al iniciar la app
  useEffect(() => {
    const loadEditors = async () => {
      const rawData = await waitForMessage();
    
      let data;
      try {
        data = JSON.parse(rawData);
        // //console.log("La data parseada es: ", data);
      } catch (error) {
        console.error("Error al hacer JSON.parse de los datos:", error);
        return;
      }
    
      if (data && Array.isArray(data.data)) {
    
        // Accedemos al array dentro de "data"
        const editorsData = data.data;
      
        // Si recibimos datos, cargamos los editores con la información
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
          layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
            type: "tab",
            component: "EditorComponent",
            id: "main.py",
            name: `main.py`,
            enableClose: true,
          });
          setEditors([{ id: 'main.py', code: '' }]);
          setFiles([{ id: 'main.py', code: '' }]);
        }
      }
    };

    loadEditors();
  }, []);

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
    setEditors((prevEditors) =>
      prevEditors.map((editor) => 
        editor.id === id ? { ...editor, code: newCode } : editor
      )
    );
  };

  // Combinar el código de todos los editores y ejecutarlo
  const handleRunCode = async () => {
    // Crear el objeto de estado de los editores para enviarlo
    const stateToPost = editors.map(editor => ({
      id: editor.id,
      code: editor.code
    }));

    // Enviar el estado actual de los editores mediante postEvent
    postEvent("STATE", "Guardando estado de los editores", [], stateToPost);

    await runPythonCode(editors, {}, {}, mode)
  };

  const saveEditors = () => {
    const stateToPost = editors.map(editor => ({
      id: editor.id,
      code: editor.code
    }));

    postEvent("STATE", "Guardando estado de los editores", [], stateToPost);
  }

  const restoreExercise = () => {
    // Loop through each file ID and delete it using deleteFile function
    files.forEach(file => deleteFile(file.id));
    
    // Clear the current editors and files
    setEditors([]);
    setFiles([]);
    setOutputPyodideGraph([]);
    setOutputPyodideHistory([]);
    setOutputDecisionTree([]);

    layoutRef.current.addTabToTabSet("#3a8361ce-881c-44d6-827c-487d1fcdb066", {
      type: "tab",
      component: "EditorComponent",
      id: 'main.py',
      name: 'main.py', // or any default name you prefer
      enableClose: true, // Adjust as needed
    });

    // Initialize editors and files with default values if needed
    setEditors([{ id: 'main.py', code: '' }]);
    setFiles([{ id: 'main.py', code: '' }]);
  
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
        id: nombreEditor,
        name: nombreEditor,
        enableClose: true, // Permitir cerrar para nuevos editores
      });

      setEditors([...editors, { id: nombreEditor, code: '' }]);
      setFiles((prevFiles) => [...prevFiles, { id: nombreEditor, code: '' }]);
    }
  }, [editors]);
  

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

  const factory = useCallback((node) => {
    const component = node.getComponent();

    switch (component) {
      case 'EditorComponent': {
        const editorId = node.getName();
        const editorData = editors?.find((editor) => editor.id === editorId);
        return (
          <Editor
            value={editorData ? editorData.code : ''}
            onChange={(newCode) => handleCodeChange(editorId, newCode)}
            mode={mode}
            fontSize={fontSize}
          />
        );
      }
      case 'TerminalOutputComponent':
        return (
          <TerminalOutput
            history={outputPyodideHistory}
            inputPrompt={outputPyodideInput}
            onInputSubmit={provideInput}
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
        )
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
        )
      case 'OptionsComponent':
        return (
          <BorderRight
            mode={mode}
          />
        );  
      default:
        return <div>Componente no definido: {component}</div>;
    }
  }, [editors, outputPyodideHistory, provideInput, waitingForInput, handleRunCode, mode, files, fontSize]);


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
  
  
  return (
    <div className={`sandbox-container ${mode}`}>
      <TopNavBar 
        onRunCode={handleRunCode} 
        addEditor={addEditor} 
        downloadCodes={downloadCodes} 
        saveEditors={saveEditors} 
        restoreExercise={restoreExercise} 
        setEditorFontSize={setFontSize} 
        interruptExecution={interruptExecution} 
        loadingPackages={loadingPackages} 
        loadingExecution={loadingExecution}
        onFileUpload={handleFileUpload}
        />
      <div className="flexlayout-wrapper">
        <Layout 
          ref={layoutRef} 
          model={model} 
          factory={factory} 
          className="flexlayout-container" 
        />
      </div>
    </div>
  );
};

export default Sandbox;