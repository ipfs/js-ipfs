module.exports = function (config) {
  var path = require('path')
  var node_modules_dir = path.join(__dirname, 'node_modules')
  var deps = [
    'peer-id/deps/forge.bundle.js'
  ]
  
  config.set({
    basePath: '',
    frameworks: ['mocha'],

    files: [
      'tests/test-core/browser.js'
    ],

    preprocessors: {
      'tests/test-core/*': ['webpack']
    },

    webpack: {
      resolve: {
        extensions: ['', '.js', '.json'],
        alias: {'node-forge': node_modules_dir+'/peer-id/deps/forge.bundle.js' }
      },
      externals: {
        fs: '{}'
      },
      node: {
        Buffer: true
      },
      module: {
        loaders: [
          { test: /\.json$/, loader: 'json' }
        ],
        noParse: []
      },
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
    singleRun: true
  })

  deps.forEach(function (dep) {
    var depPath = path.resolve(node_modules_dir, dep)
    config.webpack.module.noParse.push(depPath)
  })
}
