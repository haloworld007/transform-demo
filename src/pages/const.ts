export const SCHEMA = {
  componentsMap: [
    {
      name: 'Button',
      package: 'antd',
      version: '4.0.0',
      destructuring: true,
    },
    {
      name: 'Page',
      package: '@seada/react',
      version: '1.0.0',
      destructuring: true,
    },
  ],
  utilsMap: [
    {
      name: 'goBack',
      package: '@seada/utils',
      version: '1.0.0',
      destructuring: true,
    },
  ],
  page: {
    type: 'void',
    'x-component': 'Page',
    'x-data': {
      vars: [
        {
          name: 'var1',
          varType: 'state',
          dataType: 'string',
          initialValue: 'hello world',
        },
        {
          name: 'var2',
          varType: 'state',
          dataType: 'number',
          initialValue: 123,
        },
        {
          name: 'var3',
          varType: 'state',
          dataType: 'boolean',
          initialValue: false,
        },
      ],
    },
    properties: {
      button: {
        type: 'void',
        'x-component': 'Button',
        'x-data': {
          actions: [
            {
              eventName: 'onClick',
              handler: {
                type: 'platform',
                name: 'goBack',
                params: {},
              },
            },
          ],
        },
        'x-content': '点击',
      },
    },
  },
};
