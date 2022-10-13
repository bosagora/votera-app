const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

dotenv.config();

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins.push(new Dotenv());
  // if (env.mode === 'production') {
  //   config.plugins.push(
  //     new BundleAnalyzerPlugin({
  //       path: 'web-report',
  //     })
  //   );
  // }  
  return config;
};
