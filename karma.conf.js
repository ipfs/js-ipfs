module.exports = function (config) {
  var path = require('path')
  var nodeForgePath = path.resolve(__dirname, 'node_modules/peer-id/vendor/forge.bundle.js')

  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      nodeForgePath,
      'test/core-tests/browser.js'
    ],

    preprocessors: {
      'test/core-tests/*': ['webpack']
    },

    webpack: {
      resolve: {
        extensions: ['', '.js', '.json']
      },
      externals: {
        fs: '{}',
        'node-forge': 'forge',
        'ipfs-data-importing': '{ import: {} }',
        'libp2p-ipfs': {} // to be 'libp2p-ipfs-browser'
      },
      node: {
        Buffer: true
      },
      module: {
        loaders: [
          { test: /\.json$/, loader: 'json' }
        ],
        postLoaders: [{
          test: /\.js$/,
          loader: 'transform?brfs',
          include: /node_modules\/peer-id/
        }]
      }
    },

    webpackMiddleware: {
      noInfo: true,
      stats: {
        colors: true
      }
    },
    reporters: ['spec'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
    captureTimeout: 60000,
    singleRun: true
  })
}
