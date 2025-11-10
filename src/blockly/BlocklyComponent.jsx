import React, { useEffect, useRef } from 'react';
import * as Blockly from 'blockly/core';
import { pythonGen } from './blocks/generators/pythonGenerator';
import { toolbox } from './toolbox/toolbox';
import CustomTheme from './toolbox/CustomTheme';
import { CustomCategory } from './toolbox/CustomCategory';
import { blockDefinitions } from './blocks/bloques/bloques';
import './blocks/validaciones/validaciones';
import { debounce } from 'lodash';

Blockly.common.defineBlocks(blockDefinitions);

const BlocklyComponent = ({ onCodeChange }) => {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);

  useEffect(() => {
    if (blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        theme: CustomTheme,
        renderer: 'thrasos',
        toolbox,
        zoom: {
          controls: true,
          wheel: true,
          pinch: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
        },
        trashcan: true,
        scrollbars: false,
      });

      const handleCodeChange = debounce(() => {
        if (workspace.current && pythonGen) {
          try {
            const code = pythonGen.workspaceToCode(workspace.current);
            if (onCodeChange) {
              onCodeChange(code); // Enviar el código generado a través del callback
            }
          } catch (error) {
            console.error('Error generating code:', error);
          }
        }
      }, 300); // 300 ms de delay, puedes ajustar este valor según tus necesidades

      workspace.current.addChangeListener(handleCodeChange);

      // Función para redimensionar Blockly cuando el contenedor cambia de tamaño
      const resizeBlockly = () => {
        if (workspace.current) {
          Blockly.svgResize(workspace.current);
        }
      };

      // Añade un ResizeObserver para manejar el evento de redimensionamiento del contenedor
      const resizeObserver = new ResizeObserver(resizeBlockly);
      resizeObserver.observe(blocklyDiv.current);

      // Cleanup observer on unmount
      return () => {
        if (workspace.current) {
          workspace.current.removeChangeListener(handleCodeChange);
        }
        resizeObserver.disconnect();
      };
    }
  }, [onCodeChange]);

  return <div ref={blocklyDiv} style={{ height: '100%', width: '100%' }} />;
};

export default BlocklyComponent;
