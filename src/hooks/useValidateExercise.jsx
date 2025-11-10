// useValidateExercise.js
import { exercises } from '../utils/exercises';
import { CodeSimulator, SyntaxValidator } from "../validator/validations/validations.js";
import { getContextFromEnunciados } from "../utils/enunciadosLoader";

/**
 * Opciones:
 * - runPy: ejecutar Pyodide si lang === "python"
 * - runIA: llamar backend IA y mostrar en BorderRight via window.mostrarResultadoHTML
 * - obtenerContexto: fn() => { enunciado, clase, idioma } (si no, se usa enunciados.json por exerciseId)
 * - onPyOutput: fn(text) para mostrar stdout/stderr donde quieras
 * - setEditorValue: fn(code) para inyectar código base si está vacío
 */
const dbg = (...a) => console.log("[validate]", ...a);
const safeFn = (f, name) => (...args) => {
  try { return f?.(...args); } catch (e) { console.error(`[validate] ${name} error:`, e); }
};

export const useValidateExercise = async (
  exerciseId,
  editors,
  lang,
  postEvent,
  stateToPost,
  {
    runPy = true,
    runIA = true,
    obtenerContexto = null,
    onPyOutput = null,
    setEditorValue = null,
  } = {}
) => {
  // const _postEvent = typeof postEvent === "function" ? postEvent : (...a) => console.warn("[validate] postEvent noop", a);
  // const _onPyOutput = typeof onPyOutput === "function" ? onPyOutput : (t) => console.log("[pyout]\n" + t);

  const failureReasons = [];
  let syntaxErrorsFound = false;
  let simulationErrorsFound = false;

  console.log("ejecuta");
  //dbg("start", { exerciseId, lang, editorsCount: editors?.length });

  try {
    // (0) Exercise & editor principal
    const exercise = exercises.find((ex) => ex.id === exerciseId);
    //dbg("exercise found?", !!exercise, exercise && { mainEditor: exercise.mainEditor, hasAST: !!exercise.validationAST, hasSim: !!exercise.validationCodeSimulator });
    if (!exercise) throw new Error("No se encontró el ejercicio");

    const codeEditor = editors.find((ed) => ed.id === exercise.mainEditor);
    //dbg("codeEditor found?", !!codeEditor, { expected: exercise.mainEditor, provided: editors?.map(e => e.id) });
    if (!codeEditor) throw new Error(`Editor principal no encontrado. Se esperaba "${exercise.mainEditor}" y llegaron: ${editors?.map(e => e.id).join(", ")}`);

    let { code } = codeEditor;

    // (1) Contexto
    let contexto;
    try {
      if (typeof obtenerContexto === "function") {
        contexto = obtenerContexto(); // { enunciado, clase, idioma }
        //dbg("context via obtenerContexto()", contexto);
      } else {
        const ctx = await getContextFromEnunciados(exerciseId, lang);
        const { enunciado, clase, codigoBase } = ctx || {};
        contexto = { enunciado, clase, idioma: (lang || "es") };
        // dbg("context via enunciados.json", contexto);
        if (codigoBase && !String(code || "").trim() && typeof setEditorValue === "function") {
          setEditorValue(codigoBase);
          code = codigoBase;
          dbg("codigoBase injected");
        }
      }
    } catch (e) {
      dbg("context error", e);
      // no abortamos; seguimos sin contexto para ver el resto
    }

    // === (2) Validación de Sintaxis (AST) ===
    if (exercise.validationAST) {
      //dbg("AST start");
      let syntaxValidate;
      try {
        syntaxValidate = await SyntaxValidator(code);
      } catch (e) {
        dbg("AST pre-validate error (syntax?)", e);
        // Si la sintaxis del Python está mal, no seguimos con AST,
        // dejamos que el resto del flujo marque FAILURE.
      }

      // Adaptar stories a { description, tests: [fn] } si vinieran con 'test' suelto
      const stories = (Array.isArray(exercise.validationAST) ? exercise.validationAST : [])
        .filter(Boolean)
        .map(st => {
          if (Array.isArray(st.test)) return st;
          if (typeof st.test === 'function') {
            const { test, ...rest } = st;
            return { ...rest, tests: [test] };
          }
          // también permitimos un test “suelto” que sea directamente una función
          if (typeof st === 'function') {
            return { description: 'inline-fn', tests: [st] };
          }
          return { description: st?.description || 'story', tests: [] };
        });

      // 1) Intento “oficial”: usar theseStories
      let ranOfficial = false;
      if (syntaxValidate && stories.some(s => (s.test || []).length)) {
        try {
          const syntaxValidationErrors = syntaxValidate.theseStories(lang, ...stories);
          //dbg("AST theseStories ok", { keys: Object.keys(syntaxValidationErrors || {}) });

          Object.values(syntaxValidationErrors || {}).forEach((lista = []) => {
            lista.forEach((error) => {
              const msg = error?.[lang] || error?.en || String(error);
              failureReasons.push(msg);
            });
          });
          ranOfficial = true;
        } catch (e) {
          dbg("AST theseStories error → fallback manual", e);
        }
      }

      // 2) Fallback manual: ejecutar tests del ejercicio con un assert shim
      if (!ranOfficial) {
        const gatherFns = [];
        for (const st of stories) {
          for (const t of (st.tests || [])) {
            if (typeof t === 'function') gatherFns.push({ fn: t, desc: st.description || 'story' });
          }
        }

        // Shim de assert: soporta $custom(fn), con logs y coerción de firma (code / code+lang)
        const runOneTest = async (tfn, desc) => {
          const collected = [];

          const assert = {
            $custom: async (fn) => {
              try {
                // 1) Llamar la función de validación del ejercicio en modo tolerante:
                //    - si declara >= 2 args, asumimos (code, lang)
                //    - si declara 1 arg, usamos (code)
                //    - si declara 0, sin args
                let res;
                if (typeof fn !== 'function') {
                  throw new Error(`$custom esperaba una función y recibió: ${typeof fn}`);
                }

                if (fn.length >= 2) {
                  res = await fn(code, lang);
                } else if (fn.length === 1) {
                  res = await fn(code);
                } else {
                  res = await fn();
                }

                // 2) Volcado de resultados
                if (Array.isArray(res)) {
                  collected.push(...res);
                } else if (res) {
                  collected.push(res);
                }
              } catch (e) {
                // Log detallado en consola + mensaje claro en UI
                console.error("[validate] $custom error en story:", desc, e);
                collected.push({
                  es: `Error interno ejecutando $custom en "${desc}": ${e?.message || e}`,
                  en: `Internal error running $custom in "${desc}": ${e?.message || e}`,
                  pt: `Erro interno ao executar $custom em "${desc}": ${e?.message || e}`,
                });
              }
            },
            // 🙋‍♂️ Si más adelante tus tests usan otros helpers (p. ej. $contains, $regex),
            // agregalos acá con la misma idea de "colectar" mensajes.
          };

          try {
            // Ejecutamos el test pasando nuestro 'assert'
            await Promise.resolve(tfn(assert));
          } catch (e) {
            console.error("[validate] Test function error en story:", desc, e);
            collected.push({
              es: `Error interno ejecutando test de "${desc}": ${e?.message || e}`,
              en: `Internal error running test of "${desc}": ${e?.message || e}`,
              pt: `Erro interno ao executar teste de "${desc}": ${e?.message || e}`,
            });
          }

          return collected;
        };

        for (const { fn, desc } of gatherFns) {
          const errs = await runOneTest(fn, desc);
          errs.forEach(err => {
            const msg = (err && (err[lang] || err.en || err.pt)) || String(err);
            if (msg) failureReasons.push(msg);
          });
        }
      }


      const had = failureReasons.length > 0;
      syntaxErrorsFound = had;
      //dbg("AST done", { syntaxErrorsFound: had, failureReasonsCount: failureReasons.length });
    } else {
      dbg("AST skipped");
    }



    // (3) Simulación
    if (exercise.validationCodeSimulator) {
      //dbg("Sim start");
      try {
        const safeCode = JSON.stringify(code);
        const codeSimulator = new CodeSimulator(safeCode);
        const simulationResults = await codeSimulator.simulate(
          lang,
          exercise.validationCodeSimulator
        );
        (simulationResults || []).forEach((r) => {
          if (!r.success) {
            simulationErrorsFound = true;
            failureReasons.push(`${r.error}`);
          }
        });
        //dbg("Sim done", { simulationErrorsFound, failureReasons });
      } catch (e) {
        dbg("Sim error", e);
        throw new Error("Fallo ejecutando simulación");
      }
    } else {
      dbg("Sim skipped");
    }



    // ⭐️ ESTE LOG ES EL QUE QUERÍAS VER
    console.log("Resultados de simulación:", { simulationErrorsFound, failureReasons });

    // (4) Ejecutar Pyodide inline (opcional)
    if (runPy && (lang || "").toLowerCase() === "python") {
      //dbg("Pyodide inline start");
      const pyText = await runPythonWithCapture(code);
      onPyOutput(pyText);
      //dbg("Pyodide inline done");
    } else {
      dbg("Pyodide inline skipped");
    }

    // (5) Resultado y eventos
    const isOk = !syntaxErrorsFound && !simulationErrorsFound;
    //dbg("result", { isOk, syntaxErrorsFound, simulationErrorsFound, failureReasons });

    if (isOk) {
      // if (runIA) {
      //   await analizarConGroq(contexto?.enunciado, code, contexto?.clase, contexto?.idioma || "es", { forceSuccess: true });
      // }
      // _postEvent("SUCCESS", "Has completado el ejercicio", [], stateToPost);
      postEvent("SUCCESS", "Has completado el ejercicio", [], stateToPost);
      return;
    }

    // if (runIA) {
    //   await analizarConGroq(contexto?.enunciado, code, contexto?.clase, contexto?.idioma || "es");
    // }
    throw new Error("Falló la validación de sintaxis o simulación");
  } catch (err) {
    dbg("catch", err);
    try {
      const normalizeMsg = (r) => {
        if (typeof r === "string") return r;
        if (r && (r.es || r.en || r.pt)) return r.es || r.en || r.pt;
        try { return String(r); } catch { return "(no serializable)"; }
      };

      const failureReasonsFiltrado = (failureReasons || [])
        .map(normalizeMsg)
        .filter(msg => !String(msg).includes("El código debe corregir los errores"));

      dbg("about to post FAILURE with", failureReasonsFiltrado);
      postEvent("FAILURE", "El ejercicio está incompleto", failureReasonsFiltrado, stateToPost);
    } catch (e2) {
      console.error("[validate] catch falló al preparar/postear FAILURE", e2, { failureReasons });
    }
  }
};


/* ================= Helpers Pyodide & IA ================= */

let __pyodide;
async function ensurePyodide() {
  if (__pyodide) return __pyodide;
  if (window.pyodide) {
    __pyodide = window.pyodide;
    return __pyodide;
  }
  if (typeof loadPyodide !== "function") {
    throw new Error("Pyodide no está disponible (falta loadPyodide).");
  }
  __pyodide = await loadPyodide();
  __pyodide.setStdin({
    stdin: () => window.prompt("") ?? "",
    prompt: (msg) => window.prompt(msg) ?? ""
  });
  window.pyodide = __pyodide;
  return __pyodide;
}

async function runPythonWithCapture(code) {
  const py = await ensurePyodide();
  let stdout = "", stderr = "";

  const restoreOut = py.setStdout({
    batched: (s) => { stdout += s.split("\n").map(l => l.trim()).join("\n") + "\n"; }
  });
  const restoreErr = py.setStderr({ batched: (s) => { stderr += s; } });

  let finalText = "";
  try {
    const result = await py.runPythonAsync(code);
    if (stdout.trim()) {
      finalText = stdout
        .split("\n")
        .filter(l => l.trim().length > 0)
        .map((l, i) => `${i + 1}: ${l}`)
        .join("\n");
    }
    if (!stdout.trim() && result !== undefined && result !== null && String(result).length) {
      finalText += String(result);
    }
    if (stderr.trim()) {
      finalText += (finalText ? "\n" : "") + "❌ STDERR:\n" + stderr;
    }
  } catch (err) {
    finalText = `❌ Error:\n${String(err)}`;
  } finally {
    if (typeof restoreOut === "function") restoreOut();
    if (typeof restoreErr === "function") restoreErr();
  }
  return finalText || "(Sin salida)";
}

async function analizarConGroq(enunciado, code, clase, idioma = "es", opts = {}) {
  const { forceSuccess = false } = opts;
  const mostrar = (html) => {
    if (typeof window.mostrarResultadoHTML === "function") {
      window.mostrarResultadoHTML(html);
    }
  };

  try {
    if (!clase) {
      mostrar("<pre>⚠️ Elegí una clase antes de analizar.</pre>");
      throw new Error("Clase no definida");
    }

    console.log("Enviando a RAG:", { enunciado, clase, idioma, forceSuccess });
    // Detecta si estás en entorno local (localhost o 127.0.0.1)
    const isLocal =
      window.location.hostname.includes("localhost") ||
      window.location.hostname.includes("127.0.0.1");

    // const API_URL = isLocal
    //   ? "http://127.0.0.1:8000" // dev local
    //   : "https://admissions-barbie-clock-recognition.trycloudflare.com"; // túnel

    const API_URL = "https://schools-tools.digitalhouse.com/3"

    const response = await fetch(`${API_URL}/consejo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enunciado, codigo: code, idioma, clase, force_success: forceSuccess })
    });

    if (!response.ok) {
      const txt = await response.text();
      mostrar(`<pre>Error: ${escapeHtml(txt)}</pre>`);
      return;
    }

    const data = await response.json();
    const html = data.consejo_html
      ? data.consejo_html
      : fallbackFormatCodeFences(data.consejo || "⚠️ No se recibió un consejo.");

    let finalHTML = html;
    if (data.fuentes?.length) {
      const LABELS = {
        es: "Clase",
        en: "Class",
        pt: "Aula"
      };
      const label = LABELS[idioma] || "Clase";
      const fuentesHTML = data.fuentes
        .map(([c, s]) => `<li>${label} ${escapeHtml(String(c))}, Slide ${escapeHtml(String(s))}</li>`)
        .join("");
      const labelByLang = { es: "📚 Fuentes:", en: "📚 Sources:", pt: "📚 Fontes:" };
      const fuentesLabel = labelByLang[(idioma || "es")] || labelByLang.es;

      finalHTML += `
  <div style="margin-top:12px; background:#f9f9f9; border-left:4px solid #4caf50; padding:10px 14px; border-radius:6px;">
    <strong style="color:#333;">${fuentesLabel}</strong>
    <ul style="margin-top:6px; padding-left:20px; line-height:1.6; list-style-type:disc;">
      ${fuentesHTML}
    </ul>
  </div>`;
    }
    mostrar(finalHTML);
  } catch (error) {
    console.error("Error al conectar con el backend RAG:", error);
    mostrar("<pre>❌ Error al analizar el código con IA.</pre>");
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
function fallbackFormatCodeFences(text) {
  const regex = /```python([\s\S]*?)```/g;
  return text.replace(regex, (_m, code) =>
    `<pre><code class="language-python">${escapeHtml(code.trim())}</code></pre>`
  );
}
