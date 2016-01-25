module.exports = function (config) {
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
        extensions: ['', '.js', '.json']
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
