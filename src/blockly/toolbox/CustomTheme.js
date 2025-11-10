import * as Blockly from 'blockly';

const CustomTheme = Blockly.Theme.defineTheme('themeDH', {
    'base': Blockly.Themes.Zelos,
    'categoryStyles': {
        'data_category': {
            'colour': '#f5702f'
        },
        'operations_category': {
            'colour': '#5e548e'
        },
        'recuentos_category': {
            'colour': '#009688',
        },
        'busqueda_category': {
            'colour': '#003366',
        },
        'recuentos_condicionales_subcategory': {
            'colour': '#004d40' 
        },
        'yellow_schools_subcategory': {
            'colour': '#E6B800'
        },
        'recuentos_simples_subcategory': {
            'colour': '#00796b' 
        },
        'referencias_category': {
            'colour': '#7a7a7a'
        },
        'logic_conditional_category': {
            'colour': '#FF0000'
        },
    },
    'blockStyles': {
        'yellow_schools_ref': {
            'colourPrimary': '#E6B800',
            'colourSecondary': '#CC9900',
            'colourTertiary': '#FFCC66'
        },
        'recuentos_condicionales_blocks': {
            'colourPrimary': '#004d40', 
            'colourSecondary': '#00332b', 
            'colourTertiary': '#00695c'
        },
        'recuento_simples_blocks': {
        'colourPrimary': '#00796b',
        'colourSecondary': '#005f56',
        'colourTertiary': '#009688'
        },
        'data_block': {
            'colourPrimary': '#f5702f',
            'colourTertiary': '#d45379',
        },
        'conditional_si_block': {
            'colourPrimary': '#b71c1c', 
            'colourSecondary': '#c62828',
            'colourTertiary': '#e57373'
        },
        'conditionals_light_red': {
            'colourPrimary': '#D98282', 
            'colourSecondary': '#CC3E32',
            'colourTertiary': '#E6B8B8'
        },
        'busqueda_block': {
            'colourPrimary': '#003366', 
            'colourSecondary': '#002244', 
            'colourTertiary': '#004080'
        },
        'operation_block': {
            'colourPrimary': '#5e548e', // Color primario
            'colourSecondary': '#9b8fbc', // Color secundario
            'colourTertiary': '#d5c8e2' // Color terciario
        },
        'light_operation_block': {
            'colourPrimary': '#8e6fbc', // Color primario más claro
            'colourSecondary': '#b09cdd', // Color secundario más claro
            'colourTertiary': '#e0d9f0' // Color terciario más claro
        }
    },
    'componentStyles': {
        'toolboxForegroundColour': 'white',
        'flyoutBackgroundColour': '#ddd',
    },
    'fontStyle': {
        'family': 'Montserrat',
        'weight': 'bold',
        'size': 8,
    },
});

export default CustomTheme;