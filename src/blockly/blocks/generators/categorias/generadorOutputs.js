import { Order, generateCode } from '../pythonGenerator';

export const blocksOutputs = {
    // Generador para print
    print: function (block) {
        try {
            var value = generateCode(block, 'VALUE') || '""';
            return [`print(${value})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en print:', error);
            return ['# Error en print\n', Order.STATEMENT];
        }
    },

    // Generador para plot line
    plot_line: function (block) {
        try {
            var data = generateCode(block, 'DATA') || '[]';
            return [`plt.plot(${data})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_line:', error);
            return ['# Error en plot_line\n', Order.STATEMENT];
        }
    },

    // Generador para plot scatter
    plot_scatter: function (block) {
        try {
            var dataX = generateCode(block, 'DATA_X') || '[]';
            var dataY = generateCode(block, 'DATA_Y') || '[]';
            return [`plt.scatter(${dataX}, ${dataY})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_scatter:', error);
            return ['# Error en plot_scatter\n', Order.STATEMENT];
        }
    },

    // Generador para plot histogram
    plot_histogram: function (block) {
        try {
            var data = generateCode(block, 'DATA') || '[]';
            return [`plt.hist(${data})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_histogram:', error);
            return ['# Error en plot_histogram\n', Order.STATEMENT];
        }
    },

    // Generador para plot bar chart
    plot_bar_chart: function (block) {
        try {
            var labels = generateCode(block, 'LABELS') || '[]';
            var data = generateCode(block, 'DATA') || '[]';
            return [`plt.bar(${labels}, ${data})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_bar_chart:', error);
            return ['# Error en plot_bar_chart\n', Order.STATEMENT];
        }
    },

    // Generador para plot boxplot
    plot_boxplot: function (block) {
        try {
            var data = generateCode(block, 'DATA') || '[]';
            return [`plt.boxplot(${data})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_boxplot:', error);
            return ['# Error en plot_boxplot\n', Order.STATEMENT];
        }
    },

    // Generador para mostrar el canvas de gráficos
    show_plot_canvas: function (block) {
        try {
            return ['plt.show()\n', Order.STATEMENT];
        } catch (error) {
            console.error('Error en show_plot_canvas:', error);
            return ['# Error en show_plot_canvas\n', Order.STATEMENT];
        }
    },

    // Generador para poner título en el gráfico
    make_plot_title: function (block) {
        try {
            var title = generateCode(block, 'TITLE') || '""';
            return [`plt.title(${title})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en make_plot_title:', error);
            return ['# Error en make_plot_title\n', Order.STATEMENT];
        }
    },

    // Generador para poner etiqueta en el eje X
    make_plot_xaxis_label: function (block) {
        try {
            var label = generateCode(block, 'LABEL') || '""';
            return [`plt.xlabel(${label})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en make_plot_xaxis_label:', error);
            return ['# Error en make_plot_xaxis_label\n', Order.STATEMENT];
        }
    },

    // Generador para poner etiqueta en el eje Y
    make_plot_yaxis_label: function (block) {
        try {
            var label = generateCode(block, 'LABEL') || '""';
            return [`plt.ylabel(${label})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en make_plot_yaxis_label:', error);
            return ['# Error en make_plot_yaxis_label\n', Order.STATEMENT];
        }
    },

    // Generador para dibujar línea horizontal
    plot_horizontal_line: function (block) {
        try {
            var y = generateCode(block, 'Y') || '0';
            return [`plt.axhline(y=${y})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_horizontal_line:', error);
            return ['# Error en plot_horizontal_line\n', Order.STATEMENT];
        }
    },

    // Generador para dibujar línea vertical
    plot_vertical_line: function (block) {
        try {
            var x = generateCode(block, 'X') || '0';
            return [`plt.axvline(x=${x})\n`, Order.STATEMENT];
        } catch (error) {
            console.error('Error en plot_vertical_line:', error);
            return ['# Error en plot_vertical_line\n', Order.STATEMENT];
        }
    }
};
