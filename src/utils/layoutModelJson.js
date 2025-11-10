// src/utils/layoutModelJson.js

export const layoutModelJson = (terminalIcon, folderIcon, t) => ({
  global: {
    splitterEnableHandle: true,
    tabEnablePopout: false,
    tabSetEnableActiveIcon: false,
    tabSetMinWidth: 130,
    tabSetMinHeight: 100,
    borderMinSize: 100
  },
  borders: [
    {
      type: 'border',
      selected: 1,
      size: 310,
      id: '#border-bottom',
      location: 'bottom',
      children: [
        {
          type: 'tab',
          id: '#7bac972e-fd5f-4582-a511-4feede448394',
          name: t('graphics'), // Usar t() para traducir
          component: 'GraphOutputComponent',
          enableClose: false
        },
        {
          type: 'tab',
          id: '#c0fd1298-bcba-4f7c-a7d8-7c836944ec63',
          name: t('terminal'), // Usar t() para traducir
          enableClose: false,
          component: 'TerminalOutputComponent',
          icon: terminalIcon
        },
        {
          type: 'tab',
          id: '#c0fd1298-bc5a-4f7c-a7d8-7c836944ec73',
          name: t('threeDecision'), // Usar t() para traducir
          enableClose: false,
          component: 'DecisionTreeOutputComponent',
        },
      ]
    },
    {
      type: 'border',
      id: '#border-left',
      location: 'left',
      children: [
        {
          type: 'tab',
          id: '#3f527eca-f884-45be-b174-f7bbc27ac285',
          name: t('files'), // Usar t() para traducir
          component: 'NavigationComponent',
          enableClose: false,
          icon: folderIcon
        }
      ]
    },
    {
      type: 'border',
      location: 'right',
      id: '#border-right',
      children: [
        {
          type: 'tab',
          id: '#ee90f6c7-5724-41c8-93be-b38579c1c98f',
          name: t('options'), // Usar t() para traducir
          component: 'OptionsComponent',
          enableClose: false
        }
      ]
    }
  ],
  layout: {
    type: 'row',
    id: '#3a8361ce-881c-44d6-827c-487d1fcdb066',
    children: []
  },
  popouts: {}
});
