import { useState, useEffect, useRef } from 'react';

const usePyodide = () => {
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [loadingExecution, setLoadingExecution] = useState(false);
  const [outputPyodideHistory, setOutputPyodideHistory] = useState([]); // Historial de salidas
  const [outputPyodideInput, setOutputPyodideInput] = useState([]); // Historial de inputs
  const [outputPyodideGraph, setOutputPyodideGraph] = useState([]);
  const [outputDecisionTreeGraph, setOutputDecisionTree] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [csvFileData, setCsvFileData] = useState(null);
  const [editors, setEditors] = useState([]);
  const [packages, setPackages] = useState([]);
  const workerRef = useRef(null);

  // ===========================================================
  // 🔹 HARNESSS DE TEST (pegá todo este bloque acá)
  // ===========================================================
  // dentro de usePyodide.jsx, dentro del hook:

  const runStudentViaWorker = ({ editors, data = null, editorsNotVisible = {}, mode = "light", inputs = [], testMode = true, timeoutMs = 4000 }) => {
    return new Promise((resolve) => {
      const worker = workerRef.current;
      if (!worker) {
        resolve({ ok: false, kind: 'error', output: '', error: 'Worker no inicializado' });
        return;
      }

      // ✅ generar un reqId único para este test
      const reqId = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      let settled = false;
      const to = setTimeout(() => {
        if (!settled) {
          settled = true;
          worker.removeEventListener('message', handle);
          resolve({ ok: false, kind: 'timeout', output: '', error: '⏰ Tiempo excedido' });
        }
      }, timeoutMs);

      const handle = (e) => {
        const { type, payload, reqId: incomingReqId } = e.data || {};

        // ✅ ignorar mensajes que no sean de este test
        if (incomingReqId !== reqId) return;

        if (settled) return;

        if (type === 'output') {
          settled = true; clearTimeout(to); worker.removeEventListener('message', handle);
          const { resultado, imageDataArray, displayOutputsArray } = payload || {};
          resolve({ ok: true, kind: 'output', output: resultado || '', images: imageDataArray || [], displays: displayOutputsArray || [] });
        } else if (type === 'error') {
          settled = true; clearTimeout(to); worker.removeEventListener('message', handle);
          resolve({ ok: false, kind: 'error', output: '', error: payload || 'Error desconocido.' });
        } else if (type === 'requestInput') {
          settled = true; clearTimeout(to); worker.removeEventListener('message', handle);
          resolve({ ok: false, kind: 'error', output: '', error: 'El programa pidió más input del disponible (modo test).' });
        }
      };

      worker.addEventListener('message', handle);

      // ✅ Enviar RUN_CODE con reqId + testMode
      worker.postMessage({
        type: "RUN_CODE",
        payload: { editors, data, editorsNotVisible, mode, inputs, testMode: true}
      });
    });
  };


  const runStudentTestSuite = async ({ editors, cases, data = null, editorsNotVisible = {}, mode = "light", timeoutMs = 4000 }) => {
    for (const { name, inputs, expect } of cases) {
      const res = await runStudentViaWorker({ editors, data, editorsNotVisible, mode, inputs, testMode: true, timeoutMs });
      if (!res.ok) {
        return { passed: false, case: name, reason: (res.kind === 'timeout' ? 'timeout' : 'runtime-error'), details: res.error || '', studentOutput: res.output || '' };
      }
      if (!expect(res.output || '')) {
        return { passed: false, case: name, reason: 'assertion-failed', details: 'La salida no cumple el criterio del caso.', studentOutput: res.output || '' };
      }
    }
    return { passed: true };
  };

  // Ejecuta una suite de tests y escribe mensajes en el historial de salida
  const runAndReportSuite = async ({
    editors,
    cases,
    data = null,
    editorsNotVisible = {},
    mode = "light",
    timeoutMs = 4000,
    title = "Tests automáticos",
  }) => {
    // cabecera
    setOutputPyodideHistory(prev => [...prev, `\n🧪 ${title}`]);

    try {
      const res = await runStudentTestSuite({
        editors,
        cases,
        data,
        editorsNotVisible,
        mode,
        timeoutMs,
      });

      if (res.passed) {
        setOutputPyodideHistory(prev => [...prev, "✅ Todos los casos pasaron."]);
      } else {
        const lines = [];
        lines.push(`❌ Falló el caso: ${res.case}`);
        lines.push(`• Motivo: ${res.reason}`);
        if (res.details) lines.push(`• Detalle: ${res.details}`);
        if (res.studentOutput) {
          // mostrá última salida del alumno para diagnóstico
          lines.push("• Salida del alumno:");
          lines.push(res.studentOutput);
        }
        setOutputPyodideHistory(prev => [...prev, lines.join("\n")]);
      }
    } catch (e) {
      setOutputPyodideHistory(prev => [...prev, `❌ Error al correr tests: ${e?.message || e}`]);
    }
  };

  // ✅ Corre TODOS los casos y devuelve un array con el resultado de cada uno
  const runStudentTestSuiteAll = async ({
    editors,
    cases,
    data = null,
    editorsNotVisible = {},
    mode = "light",
    timeoutMs = 4000,
  }) => {
    const results = [];
    for (const { name, inputs, expect } of cases) {
      const r = await runStudentViaWorker({
        editors, data, editorsNotVisible, mode, inputs,
        testMode: true, timeoutMs
      });
      if (r.ok) {
        results.push({ name, ok: !!expect?.(r.output || ''), kind: 'output', output: r.output || '' });
      } else {
        results.push({ name, ok: false, kind: r.kind || 'error', error: r.error || '', output: r.output || '' });
      }
    }
    // passed si al menos uno pasó (criterio “si uno coincide ✓”)
    const anyPass = results.some(x => x.ok);
    return { passed: anyPass, results };
  };


  // ===========================================================

  // tras initializeWorker(packages):
  window.PyHarness = {
    runStudentTestSuite: (...args) => runStudentTestSuite(...args),
    runStudentViaWorker: (...args) => runStudentViaWorker(...args),
    runStudentTestSuiteAll: (...args) => runStudentTestSuiteAll(...args),
  };

  const initializeWorker = (packages) => {
    setPackages(packages)
    workerRef.current = new Worker(new URL('../workers/pyodideWorker.js', import.meta.url));

    // Manejar mensajes entrantes desde el Web Worker
    workerRef.current.onmessage = (event) => {
      const { type, payload, fileName, data, reqId } = event.data || {};

      // 🛑 Ignorar mensajes de tests (vienen taggeados con reqId)
      if (reqId) return;

      switch (type) {
        case 'status':
          break;

        case 'loaded':
          setLoadingPackages(false);
          break;

        case 'output':
          setOutputPyodideInput([]);
          setTimeout(() => {
            setLoadingExecution(false);
          }, 1000);
          setOutputPyodideHistory((prevHistory) => [...prevHistory, payload.resultado]);
          setOutputPyodideGraph(payload.imageDataArray || null);
          setOutputDecisionTree(payload.displayOutputsArray || null);
          break;

        case 'requestInput':
          setOutputPyodideInput([payload.prompt]);
          setWaitingForInput(true);
          break;

        case 'error':
          setOutputPyodideInput([]);
          setTimeout(() => {
            setLoadingExecution(false);
          }, 1000);
          setOutputPyodideHistory((prevHistory) => [...prevHistory, `Error: ${payload}`]);
          break;

        case 'CSV_DATA': {
          if (!fileName || !data) {
            console.warn("CSV_DATA mensaje incompleto:", event.data);
            break;
          }
          // Crear Blob y forzar descarga
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName; // "datos_exportados.csv" u otro
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // -----------------------------------------------------
          // Convertir los datos binarios a string, y guardarlos
          // en el estado csvFileData para que luego Sandbox sepa
          // crear el editor:
          // -----------------------------------------------------
          let csvText = '';
          csvText = data;
          setCsvFileData({ fileName, code: csvText });

          break;
        }

        default:
          console.warn(`Mensaje desconocido del worker: ${type}`);
          break;
      }
    };

    // Cargar Pyodide al montar el componente
    workerRef.current.postMessage({ type: 'LOAD_PYODIDE', payload: packages });
  };



  const interruptExecution = () => {
    setLoadingExecution(false);
    if (workerRef.current) {
      workerRef.current.terminate();
      setOutputPyodideHistory((prevHistory) => [...prevHistory, 'Ejecución detenida, espera a que carguen los paquetes nuevamente']); // Agregar mensaje al historial
      setLoadingPackages(true); // Reiniciar estado de carga
      initializeWorker(packages); // Crear un nuevo worker y cargar Pyodide nuevamente
    }
  };

  // Función para ejecutar código Python
  const runPythonCode = (editorsToRun, data, editorsNotVisible = {}, mode) => {
    setLoadingExecution(true);

    // Enviar el código de los editores al Web Worker para su ejecución
    workerRef.current.postMessage({
      type: 'RUN_CODE',
      payload: { editors: editorsToRun, data: data, editorsNotVisible: editorsNotVisible, mode: mode },
    });
  };

  // Función para proporcionar input al Web Worker
  const provideInput = (userInput) => {
    setWaitingForInput(false);
    workerRef.current.postMessage({
      type: 'PROVIDE_INPUT',
      payload: { input: userInput },
    });
  };




  return {
    setEditors,
    interruptExecution,
    setLoadingExecution,
    setLoadingPackages,
    runPythonCode,
    initializeWorker,
    setOutputPyodideGraph,
    setOutputDecisionTree,
    setOutputPyodideHistory,
    provideInput,
    setCsvFileData,
    runStudentViaWorker,// Exponer la función para uso externo
    runStudentTestSuite,// Exponer la función para uso externo
    runAndReportSuite,// Exponer la función para uso externo
    csvFileData, // Exponemos el nuevo estado
    loadingPackages,
    outputPyodideHistory, // Exponer el historial
    outputPyodideGraph,
    outputDecisionTreeGraph,
    waitingForInput,
    editors,
    loadingExecution,
    outputPyodideInput,
  };
};

export default usePyodide;
