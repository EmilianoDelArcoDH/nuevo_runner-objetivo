// public/pyodideWorker.js
// Worker clásico (NO module). Usa importScripts.
importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');

// ===================== Estado global =====================
let pyodide = null;
let isLoading = false;
let pendingInput = null;          // para modo interactivo (no test)
let stdinInputQueue = [];
let lastInputs = [];
let packagesRun = [];             // array de paquetes cargados

// ===================== Helper de mensajes =================
function send(type, extra = {}, reqId = null) {
  postMessage({ type, ...extra});
}

// ===================== Carga de Pyodide ===================
const loadPyodideAndPackages = async (packagesToLoad = []) => {
  if (pyodide !== null) return;

  isLoading = true;
  try {
    send('status', { message: 'Cargando Pyodide...' }); // sin reqId
    pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
    });
    send('status', { message: 'Pyodide cargado.' });

    // stdin para modo interactivo tradicional
    pyodide.setStdin({
      stdin: () => {
        if (stdinInputQueue.length > 0) {
          return stdinInputQueue.shift();
        }
        // Si no hay nada, devolvemos null (custom_input decide qué hacer)
        return null;
      }
    });

    const packages = Array.isArray(packagesToLoad) ? packagesToLoad : [];
    if (packages.length) {
      send('status', { message: 'Cargando paquetes de Pyodide...' });
      await pyodide.loadPackage(packages);
      send('status', { message: 'Paquetes cargados.' });
    }
  } catch (error) {
    send('error', { payload: `Error al cargar Pyodide o paquetes: ${error.message}` });
  } finally {
    isLoading = false;
    send('loaded');
  }
};

// ===================== Ejecución de código ===================
const runPythonCode = async (
  editors,
  data = null,
  editorsNotVisible = {},
  mode = "light",
  inputs = [],
  testMode = false,
  reqId = null
) => {
  // Reset de colas por corrida
  stdinInputQueue = [];
  lastInputs = [];
  if (Array.isArray(inputs) && inputs.length) {
    inputs.forEach(x => stdinInputQueue.push(String(x)));
    lastInputs = [...stdinInputQueue];
  }

  if (isLoading || pyodide === null) {
    send('error', { payload: 'Pyodide aún se está cargando.' }, reqId);
    return;
  }

  try {
    let graphicsColor = mode === "dark" ? "dark_background" : "default";

    // Normalizar editores (visibles + no visibles)
    const editorsNotVisibleArray = Object.entries(editorsNotVisible || {}).map(([id, details]) => ({
      id,
      ...details,
    }));
    const allEditors = [...editors, ...editorsNotVisibleArray];

    // Escribir archivos en FS
    allEditors.forEach(editor => {
      const fileName = `${editor.id}`;
      pyodide.FS.writeFile(fileName, editor.code);
    });

    // Datasets opcionales (se escriben como .json y se genera datasets.py)
    if (data) {
      for (const [datasetName, datasetContent] of Object.entries(data)) {
        const filePath = `${datasetName}.json`;
        pyodide.FS.writeFile(filePath, datasetContent);
      }
      const datasetNames = Object.keys(data);
      const datasetsCode = `
import json
dataset_names = ${JSON.stringify(datasetNames)}
for dataset_name in dataset_names:
    file_path = f"{dataset_name}.json"
    with open(file_path, "r") as file:
        globals()[dataset_name] = json.load(file)
`;
      pyodide.FS.writeFile('datasets.py', datasetsCode);
    }

    // ----- Construir inyección Python con custom_input determinista -----
    const pyInputsLiteral = JSON.stringify(inputs || []);
    const pyTestFlag = testMode ? "True" : "False";

    const useMicropip = Array.isArray(packagesRun) && packagesRun.includes("micropip");
    const useMatplotlib = Array.isArray(packagesRun) && packagesRun.includes("matplotlib");

    const result = await pyodide.runPythonAsync(`
import sys, io, builtins, base64, importlib, traceback
from io import StringIO
from js import XMLHttpRequest

${useMicropip ? `
import micropip
try:
    from IPython.display import display as original_display
except ImportError:
    original_display = None
def custom_display(*args, **kwargs):
    for obj in args:
        captured_display_outputs.append(str(obj))
import IPython
IPython.display.display = custom_display
` : ""}

${useMatplotlib ? `
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
def custom_show():
    global image_data
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_data = base64.b64encode(buf.read()).decode('utf-8')
    buf.close()
    images_data_list.append(img_data)
    plt.close('all')
plt.show = custom_show
` : ''}

importlib.invalidate_caches()

python_output = []
python_errors = []
input_history = []
captured_display_outputs = []
images_data_list = []

class OutputRedirector(io.StringIO):
    def write(self, text):
        if text.strip():
            input_history.append(('Output', text.strip()))

sys.stdout = OutputRedirector()
sys.stderr = OutputRedirector()

editor_modules = [editor_id for editor_id in [${allEditors.map(e => `'${e.id.replace(/\.py$/, '')}'`).join(', ')}]]
for module in editor_modules:
    if module in sys.modules:
        del sys.modules[module]

importlib.invalidate_caches()

original_input = builtins.input

# -------- custom_input: consume lista en test; delega en interactivo --------
_js_inputs = ${pyInputsLiteral}
_iter_inputs = iter(_js_inputs)
_is_test = ${pyTestFlag}

def custom_input(prompt=""):
    try:
        val = next(_iter_inputs)
        input_history.append(('Input', f"{str(val).strip()}"))
        return str(val)
    except StopIteration:
        if _is_test:
            raise EOFError("EOF when reading a line")
        # modo interactivo: pedir al usuario real
        resp = original_input(prompt)
        input_history.append(('Input', f"{str(resp).strip()}"))
        return resp

builtins.input = custom_input
# ---------------------------------------------------------------------------

try:
    main = importlib.import_module('main')
except Exception:
    python_errors.append(traceback.format_exc())
finally:
    for module in editor_modules:
        if module in sys.modules:
            del sys.modules[module]

    del sys.stdout
    del sys.stderr
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    builtins.input = original_input

python_output = '\\n'.join([
    f">>> {entry[1]}" if entry[0] == 'Input' else entry[1]
    for entry in input_history
])

('\\n'.join(python_errors), images_data_list, python_output, captured_display_outputs)
`);

    // Exportación de CSV si corresponde (antes de limpiar archivos)
    const csvExportLine = "df.to_csv";
    const shouldExportCsv = allEditors.some(editor => editor.code.includes(csvExportLine));
    if (shouldExportCsv) {
      exportCsvFiles(); // envía mensajes CSV_DATA (UI normal)
    }

    // Limpiar archivos escritos
    const deleteFileIfExists = (filePath) => {
      try {
        if (pyodide.FS.lookupPath(filePath).node) {
          pyodide.FS.unlink(filePath);
        }
      } catch {
        // noop
      }
    };
    allEditors.forEach(editor => {
      deleteFileIfExists(`/home/pyodide/${editor.id}`);
    });

    // Procesar resultados
    const [errors, imageData, resultado, capturedDisplayOutputs] = result;
    const imageDataArray = imageData.toJs();
    const displayOutputsArray = capturedDisplayOutputs.toJs();

    if (errors) {
      if (String(errors).includes('EOFError: EOF when reading a line')) {
        if (testMode) {
          // TEST: cortar limpio, no pedir más input
          stdinInputQueue = [];
          lastInputs = [];
          send('error', { payload: 'EOFError: faltan entradas para input() en modo test.' }, reqId);
        } else {
          // INTERACTIVO: limpiar colas y pedir input UNA sola vez (sin reinyectar)
          stdinInputQueue = [];
          lastInputs = [];
          pendingInput = { prompt: resultado, allEditors, data, mode };
          // Importante: enviar SIN reqId para que la UI lo reciba
          send('requestInput', { payload: { prompt: resultado } }, null);
        }
      } else {
        stdinInputQueue = [];
        lastInputs = [];
        send('error', { payload: errors }, reqId);
      }
    } else {
      send('output', { payload: { resultado, imageDataArray, displayOutputsArray } }, reqId);
      stdinInputQueue = [];
      lastInputs = [];
    }
  } catch (error) {
    stdinInputQueue = [];
    lastInputs = [];
    send('error', { payload: `Excepción en worker: ${error?.message || error}` }, reqId);
  }
};

// ===================== CSV helpers =====================
const listCsvFiles = () => {
  try {
    const files = pyodide.FS.readdir('/home/pyodide');
    return files.filter(filename => filename.toLowerCase().endsWith('.csv'));
  } catch {
    return [];
  }
};

const exportCsvFiles = () => {
  const csvFiles = listCsvFiles();
  if (csvFiles.length > 0) {
    csvFiles.forEach(fileName => {
      try {
        const fullPath = `/home/pyodide/${fileName}`;
        const csvData = pyodide.FS.readFile(fullPath, { encoding: 'utf8' });
        send('CSV_DATA', { fileName, data: csvData }); // UI normal (sin reqId)
      } catch (error) {
        send('error', { payload: `Error al leer el archivo ${fileName}: ${error.message}` });
      }
    });
  }
};

// ===================== Mensajería principal =====================
self.onmessage = async (event) => {
  const { type, payload } = event.data || {};
  switch (type) {
    case 'LOAD_PYODIDE': {
      packagesRun = Array.isArray(payload) ? payload : [];
      await loadPyodideAndPackages(packagesRun);
      break;
    }

    case 'RUN_CODE': {
      if (payload && payload.editors) {
        const {
          editors,
          data,
          editorsNotVisible,
          mode,
          inputs = [],
          testMode = false,
          reqId = null,
        } = payload;

        runPythonCode(editors, data, editorsNotVisible, mode, inputs, testMode, reqId);
      } else {
        send('error', { payload: 'No se proporcionaron editores para ejecutar.' }, payload?.reqId || null);
      }
      break;
    }

    case 'PROVIDE_INPUT': {
      // Solo para modo interactivo (no test). testMode nunca llama a PROVIDE_INPUT.
      if (pendingInput) {
        try {
          const { input } = payload;
          const { allEditors, data, mode } = pendingInput;

          // ❌ NO empujes a stdinInputQueue: runPythonCode la limpia.
          // stdinInputQueue.push(String(input));

          // ✅ Pasá el input como parámetro "inputs" a runPythonCode:
          //    así se precarga antes de ejecutar y no se pierde.
          runPythonCode(allEditors, data, {}, mode, [String(input)], false, null);

          pendingInput = null; // limpiar
        } catch (error) {
          send('error', { payload: `Error al proporcionar input: ${error.message}` });
        }
      } else {
        send('error', { payload: 'No hay input pendiente para proporcionar.' });
      }
      break;
    }

    default: {
      send('error', { payload: `Tipo de mensaje desconocido: ${type}` });
      break;
    }
  }
};
