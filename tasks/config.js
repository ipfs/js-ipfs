const webpack = require('webpack')

const shared = {
  output: {
    filename: 'ipfsapi.js',
    library: 'ipfsAPI'
  },
  resolve: {
    modulesDirectories: [
      'node_modules'
    ],
    alias: {
      http: 'stream-http',
      https: 'https-browserify'
    }
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.js$/,
      include: /node_modules\/(hoek|qs|wreck|boom)/,
      loader: 'babel',
      query: {
        presets: ['es2015'],
        plugins: ['transform-runtime']
      }
    }, {
      test: /\.json$/,
      loader: 'json'
    }]
  },
  externals: {
    net: '{}',
    fs: '{}',
    tls: '{}',
    console: '{}',
    'require-dir': '{}'
  }
}

const dev = Object.assign({}, shared, {
  devtool: 'eval',
  debug: true
})

const prod = Object.assign({}, shared, {
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      mangle: false
    }),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
})

module.exports = {
  webpack: {
    dev,
    prod
  }
}
