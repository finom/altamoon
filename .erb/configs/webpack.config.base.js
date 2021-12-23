/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';

export default {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.worker\.ts$/,
        use: { loader: 'worker-loader', options: { inline: 'no-fallback' } }
      },
    ],
  },

  output: {
    path: path.join(__dirname, '../../src'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '../src'), 'node_modules'],
    fallback: { "stream": require.resolve("stream-browserify") }
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      SKIP_RUNTIME_TESTS: '',
    }),

  ],
};
