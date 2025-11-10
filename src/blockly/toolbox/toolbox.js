import '@blockly/toolbox-search';

export const toolbox = {
  'kind': 'categoryToolbox',
  'contents': [
    {
      'kind': 'search',
      'name': 'Buscar',
      'contents': [],
    },
    {
      "kind": "category",
      "name": "Variables",
      "categoryStyle": "variable_block",
      "contents": [
        {
          "type": "variable_declaration",
          "kind": "block"
        },
        {
          "type": "variable_declaration_empty",
          "kind": "block"
        },
        {
          "type": "variable_assignment",
          "kind": "block"
        },
        {
          "type": "variable_usage",
          "kind": "block"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Decisiones",
      "colour": "#5C81A6",
      "contents": [
        {
          "kind": "block",
          "type": "controls_if"
        },
        {
          "kind": "block",
          "type": "controls_if_else"
        },
        {
          "kind": "block",
          "type": "logic_negate"
        },
        {
          "kind": "block",
          "type": "logic_compare"
        },
        {
          "kind": "block",
          "type": "logic_operation"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Iteraciones",
      "colour": "#FFAB00",
      "contents": [
        {
          "kind": "block",
          "type": "for_each_item_in_list"
        },
        {
          "kind": "block",
          "type": "while_loop"
        },
        {
          "kind": "block",
          "type": "break"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Valores",
      "colour": "#4C97FF",
      "contents": [
        {
          "kind": "block",
          "type": "text"
        },
        {
          "kind": "block",
          "type": "number"
        },
        {
          "kind": "block",
          "type": "boolean"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Output",
      "colour": "#4C97FF",
      "contents": [
        {
          "kind": "block",
          "type": "print"
        },
        {
          "kind": "block",
          "type": "plot_line"
        },
        {
          "kind": "block",
          "type": "plot_scatter"
        },
        {
          "kind": "block",
          "type": "plot_histogram"
        },
        {
          "kind": "block",
          "type": "plot_bar_chart"
        },
        {
          "kind": "block",
          "type": "plot_boxplot"
        },
        {
          "kind": "block",
          "type": "show_plot_canvas"
        },
        {
          "kind": "block",
          "type": "make_plot_title"
        },
        {
          "kind": "block",
          "type": "make_plot_xaxis_label"
        },
        {
          "kind": "block",
          "type": "make_plot_yaxis_label"
        },
        {
          "kind": "block",
          "type": "plot_horizontal_line"
        },
        {
          "kind": "block",
          "type": "plot_vertical_line"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Inputs",
      "colour": "#4C97FF",
      "contents": [
        {
          "kind": "block",
          "type": "input"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Cálculos",
      "colour": "#5C81A6",
      "contents": [
        {
          "kind": "block",
          "type": "math_operation"
        },
        {
          "kind": "block",
          "type": "math_round"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Conversión",
      "colour": "#F39C12",
      "contents": [
        {
          "kind": "block",
          "type": "convert_to_float"
        },
        {
          "kind": "block",
          "type": "convert_to_int"
        },
        {
          "kind": "block",
          "type": "convert_to_str"
        },
        {
          "kind": "block",
          "type": "convert_to_bool"
        }
      ]
    },
    {
      "kind": "category",
      "name": "Funciones",
      "colour": "#4A90E2",
      "contents": [
        {
          "kind": "block",
          "type": "function_definition"
        },
        {
          "kind": "block",
          "type": "function_definition_with_params"
        },
        {
          "kind": "block",
          "type": "return"
        }
      ]
    }
    
    
        
  ]
};
