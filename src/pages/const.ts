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
