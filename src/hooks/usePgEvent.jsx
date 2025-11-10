import { useState, useEffect } from "react";

export const usePgEvent = () => {
  const [data, setData] = useState({
    type: "blockly-type",
    id: "",
    state: "",
  });

  const getValues = () => {
    const url = document.location.href;
    const paths = url.split("?");
    if (paths.length < 2) {
      return;
    }

    const queryStrings = paths[1].split("&");
    queryStrings.forEach((qs) => {
      const values = qs.split("=");
      if (values.length >= 2) {
        if (values[0] === "id") {
          setData((prevData) => ({ ...prevData, id: values[1] }));
        }
      }
    });
  };

  const isValidInitialEvent = (event) => {
    return (
      event?.data?.data &&
      event?.data?.type === "init" &&
      typeof event.data.data == "string"
    );
  };

  const waitForMessage = async (timeout = 2000) => {
    return new Promise((resolve, reject) => {
      // Crear un temporizador que rechaza la promesa si no se recibe nada en el tiempo dado
      const timer = setTimeout(() => {
        window.removeEventListener("message", handler); // Limpiar el listener
        resolve(null); // Resolver la promesa con null en caso de timeout
      }, timeout);

      function handler(event) {
        if (isValidInitialEvent(event)) {
          clearTimeout(timer); // Limpiar el temporizador si se recibe el evento válido
          window.removeEventListener("message", handler); // Limpiar el listener
          resolve(event.data.data); // Resolver la promesa con la información
        }
      }

      window.addEventListener("message", handler);
    });
  };



  const postToPg = (dataObject) => {
    const newDataObject = { ...dataObject, type: data.type, id: data.id };
    //console.log("Estoy usando el evento ",dataObject.event," con el objeto: ", dataObject);
    window.top.postMessage(newDataObject, "*");
  };

  const postEvent = (eventType, message, reasons, state) => {
  const payload = { data: state, eventType };
  const dataObject = {
    event: eventType,
    message,
    reasons,
    state: JSON.stringify(payload),
  };

  postToPg(dataObject);
};

  useEffect(() => {
    getValues(); // Get values when the component mounts
  }, []);

  return {
    data,
    postEvent,
    waitForMessage
  };
};
