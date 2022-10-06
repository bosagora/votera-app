module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['inline-dotenv'],
      [
        'module-resolver',
        {
          root: ['.'],
          extensions:['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
          alias: {
            '~': './src',
            '@utils': './src/utils',
            '@lib': './src/lib',
            '@assets': './assets',
            '@screens': './src/screens',
            '@components': './src/components',
            '@config': './config'
          },
        }
      ],
      ['react-native-reanimated/plugin'],
      ['graphql-tag']
    ]
  };
};
