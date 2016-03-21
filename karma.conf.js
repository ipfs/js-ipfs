module.exports = function (config) {
  var path = require('path')
  var nodeForgePath = path.resolve(__dirname, 'node_modules/peer-id/deps/forge.bundle.js')

  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      nodeForgePath,
      'tests/test-core/browser.js'
    ],

    preprocessors: {
      'tests/test-core/*': ['webpack']
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
        ]
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
