import { useEffect, useState } from "react";

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

  /**
   * Obtiene el parámetro ?id=... de la URL actual
   */
  const getValues = () => {
    try {
      const url = document.location.href;
      const paths = url.split("?");
      if (paths.length < 2) return;

      const queryStrings = paths[1].split("&");
      queryStrings.forEach((qs) => {
        const values = qs.split("=");
        if (values.length >= 2 && values[0] === "id") {
          setData((prevData) => ({
            ...prevData,
            id: decodeURIComponent(values[1]),
          }));
        }
      });
    } catch (err) {
      console.warn("[PGEvent] Error al obtener id desde la URL", err);
    }
  };

  /**
   * Envía un postMessage al contenedor superior o padre
   */
  const postToPg = (dataObject) => {
    try {
      const newDataObject = {
        ...dataObject,
        type: data.type,
        id: data.id,
      };

      console.log("[PGEvent] postMessage →", newDataObject);

      // Enviar al top o parent según el contexto
      const target = window.top || window.parent || window;
      target.postMessage(newDataObject, "*");
    } catch (err) {
      console.error("[PGEvent] Error al enviar postMessage", err);
    }
  };

  /**
   * Publica un evento completo con estado y razones
   */
  const postEvent = (eventType, message, reasons = [], state = {}) => {
    try {
      const dataObject = {
        event: eventType,
        message,
        reasons: Array.isArray(reasons)
          ? reasons
          : [String(reasons)],
        state: { event: eventType, data: state }, // enviar OBJETO, no string
        ts: Date.now(),
      };

      if (!data.id) {
        console.warn(
          "[PGEvent] Falta ?id=... en la URL, el contenedor podría ignorar el evento."
        );
      }

      postToPg(dataObject);
    } catch (err) {
      console.error("[PGEvent] Error al ejecutar postEvent", err);
    }
  };

  /**
   * Inicializa el hook al montar el componente
   */
  useEffect(() => {
    getValues();

    window.addEventListener("message", (e) => {
      console.log("[PGEvent] Mensaje recibido:", e.data);
    });

    return () => {
      window.removeEventListener("message", () => {});
    };
  }, []);

  return {
    data,
    postToPg,
    postEvent,
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
