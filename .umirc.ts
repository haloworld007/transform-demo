import { defineConfig } from 'umi';
// import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
  // chainWebpack(config, { webpack }) {
  //   config.plugin('monaco-editor').use(MonacoWebpackPlugin, [
  //     {
  //       languages: ['json', 'javascript'],
  //     },
  //   ]);
  // },
});
