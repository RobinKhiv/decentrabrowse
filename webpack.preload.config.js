const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  target: 'electron-preload',
  entry: './src/main/preload.ts',
  output: {
    path: path.resolve(__dirname, 'dist/main'),
    filename: 'preload.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "http": false,
      "https": false,
      "crypto": false,
      "stream": false,
      "buffer": false,
      "util": false,
      "assert": false,
      "path": false,
      "fs": false,
      "net": false,
      "tls": false,
      "zlib": false
    }
  },
  node: {
    __dirname: false,
    __filename: false,
    global: true
  },
  externals: {
    ethers: 'commonjs2 ethers'
  }
}; 