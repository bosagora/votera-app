const dotenv = require('dotenv');
const Dotenv = require('dotenv-webpack');
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

dotenv.config();

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  // Customize the config before returning it.
  config.plugins.push(new Dotenv());

  if (config.mode === 'development') {
    const url = new URL(process.env.SERVER_URL);
    let port = parseInt(url.port, 10);
    if (!port) {
      port = url.protocol === 'https:' ? 443 : 80;
    }
    config.devServer.proxy = {
      context: ['/graphql', '/uploads'],
      target: {
        host: url.hostname,
        protocol: url.protocol,
        port,
      },
      secure: false,
      chagneOrigin: true,
      logLevel: 'info',
    };
  }
  return config;
};
