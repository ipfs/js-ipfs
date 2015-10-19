module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: [
      'test/test.js'
    ],
    exclude: [],
    preprocessors: {
      'test/**/*.js': ['browserify']
    },

    browserify: {
      debug: true,
      transform: [
        'brfs'
      ]
    },
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: [process.env.TRAVIS ? 'Firefox' : 'Chrome'],
    singleRun: false
  })
}
