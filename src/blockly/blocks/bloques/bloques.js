import * as Blockly from 'blockly';
import { variablesBlocks } from './categorias/variables';
import { decisionBlocks } from './categorias/decisiones';
import { iterationBlocks } from './categorias/Iteration';
import { valoresBlocks } from './categorias/valores';
import { outputsBlocks } from './categorias/outputs'; 
import { inputsBlocks } from './categorias/inputs';
import { calculationBlocks } from './categorias/calculationBlocks';
import { conversionBlocks } from './categorias/conversionBlocks';
import { functionsBlocks } from './categorias/functionBlocks';

const bloques = [
  ...variablesBlocks,
  ...decisionBlocks,
  ...valoresBlocks,
  ...iterationBlocks,
  ...outputsBlocks,
  ...inputsBlocks,
  ...calculationBlocks,
  ...conversionBlocks,
  ...functionsBlocks
];

export const blockDefinitions = Blockly.common.createBlockDefinitionsFromJsonArray(bloques);