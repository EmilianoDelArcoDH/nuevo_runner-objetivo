import { useEffect, useState, useCallback, useRef } from "react";

/**
 * Hook usePgEvent
 * Envía y recibe eventos entre iframe y contenedor (por ejemplo, plataforma Schools)
 * Usado para comunicar SUCCESS / FAILURE de ejercicios o simulaciones.
 */
export const usePgEvent = () => {
  const [data, setData] = useState({
    type: "blockly-type",
    id: "",
  });

  // Guardamos una referencia al handler para poder removerlo
  const msgHandlerRef = useRef(null);

  /**
   * Obtiene el parámetro ?id=... de la URL actual
   */
  const getValues = () => {
    try {
      const url = document.location.href;
      const parts = url.split("?");
      if (parts.length < 2) return;

      const queryStrings = parts[1].split("&");
      queryStrings.forEach((qs) => {
        const [k, v] = qs.split("=");
        if (k === "id" && v) {
          setData((prev) => ({ ...prev, id: decodeURIComponent(v) }));
        }
      });
    } catch (err) {
      console.warn("[PGEvent] Error al obtener id desde la URL", err);
    }
  };

  /**
   * Envía un postMessage al contenedor superior o padre
   */
  const postToPg = useCallback((dataObject) => {
    try {
      const newDataObject = {
        ...dataObject,
        type: data.type,
        id: data.id,
      };

      console.log("[PGEvent] postMessage →", newDataObject);

      const target = window.top || window.parent || window;
      // Si conocés el origin del padre, reemplazá "*" por ese origin
      target.postMessage(newDataObject, "*");
    } catch (err) {
      console.error("[PGEvent] Error al enviar postMessage", err);
    }
  }, [data.type, data.id]);

  /**
   * Publica un evento completo con estado y razones
   */
  const postEvent = useCallback((eventType, message, reasons = [], state = {}) => {
    try {
      const normReasons = Array.isArray(reasons) ? reasons : [String(reasons)];
      const dataObject = {
        event: eventType,
        message,
        reasons: normReasons,
        state: JSON.stringify({ event: eventType, data: state }), // ← OBJETO, no string
        ts: Date.now(),
      };

      if (!data.id) {
        console.warn("[PGEvent] Falta ?id=... en la URL; el contenedor podría ignorar el evento.");
      }

      postToPg(dataObject);
    } catch (err) {
      console.error("[PGEvent] Error al ejecutar postEvent", err);
    }
  }, [data.id, postToPg]);

  /**
   * (Opcional) Esperar un mensaje que cumpla un predicado, con timeout
   */
  const waitForMessage = useCallback((predicate, { timeout = 5000 } = {}) => {
    return new Promise((resolve) => {
      let done = false;

      const onMsg = (e) => {
        try {
          const d = e?.data;
          if (!predicate || predicate(d, e)) {
            done = true;
            window.removeEventListener("message", onMsg);
            clearTimeout(tid);
            resolve(d);
          }
        } catch {
          // ignorar error de predicado y seguir escuchando
        }
      };

      const tid = setTimeout(() => {
        if (done) return;
        window.removeEventListener("message", onMsg);
        resolve(null); // devolvemos null si no llegó nada a tiempo
      }, timeout);

      window.addEventListener("message", onMsg);
    });
  }, []);

  /**
   * Ping de prueba para verificar el canal (padre debería loguearlo)
   */
  // const postPing = useCallback(() => {
  //   postToPg({ event: "PING", message: "ping desde alumno", ts: Date.now() });
  // }, [postToPg]);

  /**
   * Inicializa el hook al montar el componente
   */
  useEffect(() => {
    getValues();

    // Definir handler UNA sola vez y removerlo correctamente
    const onMessage = (e) => {
      console.log("[PGEvent] Mensaje recibido:", e.data);
    };
    msgHandlerRef.current = onMessage;
    window.addEventListener("message", onMessage);

    return () => {
      if (msgHandlerRef.current) {
        window.removeEventListener("message", msgHandlerRef.current);
      }
    };
  }, []);

  return {
    data,
    postToPg,
    postEvent,
    waitForMessage, // ← exportado (útil para Exercise.jsx)
    // postPing,       // ← utilidad rápida para probar canal
  };
};




// import { useState, useEffect } from "react";

// export const usePgEvent = () => {
//   const [data, setData] = useState({
//     type: "blockly-type",
//     id: "",
//     state: "",
//   });

//   const getValues = () => {
//     const url = document.location.href;
//     const paths = url.split("?");
//     if (paths.length < 2) {
//       return;
//     }

//     const queryStrings = paths[1].split("&");
//     queryStrings.forEach((qs) => {
//       const values = qs.split("=");
//       if (values.length >= 2) {
//         if (values[0] === "id") {
//           setData((prevData) => ({ ...prevData, id: values[1] }));
//         }
//       }
//     });
//   };

//   const isValidInitialEvent = (event) => {
//     return (
//       event?.data?.data &&
//       event?.data?.type === "init" &&
//       typeof event.data.data == "string"
//     );
//   };

//   const waitForMessage = async (timeout = 2000) => {
//     return new Promise((resolve, reject) => {
//       // Crear un temporizador que rechaza la promesa si no se recibe nada en el tiempo dado
//       const timer = setTimeout(() => {
//         window.removeEventListener("message", handler); // Limpiar el listener
//         resolve(null); // Resolver la promesa con null en caso de timeout
//       }, timeout);

//       function handler(event) {
//         if (isValidInitialEvent(event)) {
//           clearTimeout(timer); // Limpiar el temporizador si se recibe el evento válido
//           window.removeEventListener("message", handler); // Limpiar el listener
//           resolve(event.data.data); // Resolver la promesa con la información
//         }
//       }

//       window.addEventListener("message", handler);
//     });
//   };



//   const postToPg = (dataObject) => {
//     const newDataObject = { ...dataObject, type: data.type, id: data.id };
//     //console.log("Estoy usando el evento ",dataObject.event," con el objeto: ", dataObject);
//     window.top.postMessage(newDataObject, "*");
//   };

//   const postEvent = (eventType, message, reasons, state) => {
//   const payload = { data: state, eventType };
//   const dataObject = {
//     event: eventType,
//     message,
//     reasons,
//     state: JSON.stringify(payload),
//   };

//   postToPg(dataObject);
// };

//   useEffect(() => {
//     getValues(); // Get values when the component mounts
//   }, []);

//   return {
//     data,
//     postEvent,
//     waitForMessage
//   };
// };
