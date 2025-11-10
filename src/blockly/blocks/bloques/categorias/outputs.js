import * as Blockly from 'blockly';

// Bloques de output
export const outputsBlocks = [
    // Bloque para print
    {
        "type": "print",
        "message0": "imprimir %1",
        "args0": [
            {
                "type": "input_value",
                "name": "VALUE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Imprime un valor en la consola",
        "helpUrl": ""
    },

    // Bloque para plot line
    {
        "type": "plot_line",
        "message0": "dibujar línea con datos %1",
        "args0": [
            {
                "type": "input_value",
                "name": "DATA"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja un gráfico de líneas con los datos dados",
        "helpUrl": ""
    },

    // Bloque para plot scatter
    {
        "type": "plot_scatter",
        "message0": "dibujar gráfico de dispersión con datos X %1 datos Y %2",
        "args0": [
            {
                "type": "input_value",
                "name": "DATA_X"
            },
            {
                "type": "input_value",
                "name": "DATA_Y"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja un gráfico de dispersión con los datos X e Y",
        "helpUrl": ""
    },

    // Bloque para plot histogram
    {
        "type": "plot_histogram",
        "message0": "dibujar histograma con datos %1",
        "args0": [
            {
                "type": "input_value",
                "name": "DATA"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja un histograma con los datos dados",
        "helpUrl": ""
    },

    // Bloque para plot bar chart con tick label
    {
        "type": "plot_bar_chart",
        "message0": "dibujar gráfico de barras con etiquetas %1 y datos %2",
        "args0": [
            {
                "type": "input_value",
                "name": "LABELS"
            },
            {
                "type": "input_value",
                "name": "DATA"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja un gráfico de barras con etiquetas y datos",
        "helpUrl": ""
    },

    // Bloque para plot boxplot
    {
        "type": "plot_boxplot",
        "message0": "dibujar boxplot con datos %1",
        "args0": [
            {
                "type": "input_value",
                "name": "DATA"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja un boxplot con los datos dados",
        "helpUrl": ""
    },

    // Bloque para mostrar el canvas de gráficos
    {
        "type": "show_plot_canvas",
        "message0": "mostrar canvas de gráficos",
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Muestra el canvas de gráficos",
        "helpUrl": ""
    },

    // Bloque para poner título en el gráfico
    {
        "type": "make_plot_title",
        "message0": "poner título %1 en el gráfico",
        "args0": [
            {
                "type": "input_value",
                "name": "TITLE"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Añade un título al gráfico",
        "helpUrl": ""
    },

    // Bloque para poner etiqueta en el eje X
    {
        "type": "make_plot_xaxis_label",
        "message0": "poner etiqueta %1 en el eje X",
        "args0": [
            {
                "type": "input_value",
                "name": "LABEL"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Añade una etiqueta al eje X del gráfico",
        "helpUrl": ""
    },

    // Bloque para poner etiqueta en el eje Y
    {
        "type": "make_plot_yaxis_label",
        "message0": "poner etiqueta %1 en el eje Y",
        "args0": [
            {
                "type": "input_value",
                "name": "LABEL"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Añade una etiqueta al eje Y del gráfico",
        "helpUrl": ""
    },

    // Bloque para dibujar línea horizontal
    {
        "type": "plot_horizontal_line",
        "message0": "dibujar línea horizontal en Y = %1",
        "args0": [
            {
                "type": "input_value",
                "name": "Y"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja una línea horizontal en el gráfico",
        "helpUrl": ""
    },

    // Bloque para dibujar línea vertical
    {
        "type": "plot_vertical_line",
        "message0": "dibujar línea vertical en X = %1",
        "args0": [
            {
                "type": "input_value",
                "name": "X"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "style": "output_block",
        "tooltip": "Dibuja una línea vertical en el gráfico",
        "helpUrl": ""
    }
]
