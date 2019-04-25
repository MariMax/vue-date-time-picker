const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const vueConfig = require('@vue/cli-service/webpack.config.js');
module.exports = ({config, mode}) => {


  const newConfig = {
    ...vueConfig, // use vue's webpack configuration by default
    entry: config.entry, // overwite entry
    output: config.output, // overwrite output
    externals: config.externals,
    plugins: [
      ...config.plugins.filter(i => i.constructor.name !== 'ForkTsCheckerWebpackPlugin'),
      new ForkTsCheckerWebpackPlugin(
        {
          vue: true,
          tslint: true,
          formatter: 'codeframe',
          checkSyntacticErrors: false
        }
      )
    ],
    resolve: { // <--------- This bit here
      ...vueConfig.resolve,
      // ...config.resolve,
      alias: {
        ...vueConfig.resolve.alias,
        ...config.resolve.alias,
        vue$: config.resolve.alias.vue$
      }
    }
  };

  return newConfig;
};
