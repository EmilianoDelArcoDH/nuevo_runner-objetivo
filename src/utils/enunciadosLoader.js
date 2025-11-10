let __ENUN_CACHE = null;

async function importJsonESM() {
  const mod = await import("./enunciados.json", { assert: { type: "json" } });
  return mod.default || mod;
}

async function fetchRelativeJson() {
  const url = new URL("./enunciados.json", import.meta.url);
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo cargar enunciados.json");
  return await res.json();
}

export async function loadEnunciados() {
  if (__ENUN_CACHE) return __ENUN_CACHE;
  try {
    __ENUN_CACHE = await importJsonESM();
  } catch {
    __ENUN_CACHE = await fetchRelativeJson();
  }
  return __ENUN_CACHE;
}

export async function getContextFromEnunciados(exerciseId, lang = "es") {
  const data = await loadEnunciados();
  const item = data.find(e => e.id === exerciseId); // 🔑 match directo

  const idioma = ["es", "en", "pt"].includes(lang?.toLowerCase())
    ? lang.toLowerCase()
    : "es";

  const enunciado = item?.[idioma] || item?.es || "Analizá este código.";
  const clase = item?.clase || null;
  const codigoBase = item?.codigo?.[idioma] || "";

  return { enunciado, clase, codigoBase };
}
