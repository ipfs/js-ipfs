'use strict'

const path = require('path')
const IPFSFactory = require('ipfsd-ctl')
const parallel = require('async/parallel')
const MockPreloadNode = require('./test/utils/mock-preload-node')

const ipfsdServer = IPFSFactory.createServer()
const preloadNode = MockPreloadNode.createNode()

module.exports = {
  webpack: {
    resolve: {
      mainFields: ['browser', 'main']
    }
  },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/js/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 100 * 1000,
    reporters: ['mocha-own', 'coverage-istanbul'],
    coverageIstanbulReporter: {
      reports: ['json'],
      dir: path.join(__dirname, 'coverage'),
      combineBrowserReports: true,
      fixWebpackSourcePaths: true,
    },
    preprocessors: { 'node_modules/aegir/src/config/karma-entry.js': [ 'webpack', 'sourcemap' ] },
    webpack: {
      module: {
        rules: [
          // instrument only testing sources with Istanbul
          {
            test: /\.js$/,
            use: { loader: 'istanbul-instrumenter-loader' },
            include: path.resolve('src/')
          }
        ]
      }
    },
    customLaunchers: {
      ChromeDocker: {
        base: 'ChromeHeadless',
        // We must disable the Chrome sandbox when running Chrome inside Docker (Chrome's sandbox needs
        // more permissions than Docker allows by default)
        flags: ['--no-sandbox']
      }
    },
    client: {
      mocha: {
        bail: true,
      }
    },
    singleRun: true
  },
  hooks: {
    node: {
      pre: (cb) => preloadNode.start(cb),
      post: (cb) => preloadNode.stop(cb)
    },
    browser: {
      pre: (cb) => {
        parallel([
          (cb) => {
            ipfsdServer.start()
            cb()
          },
          (cb) => preloadNode.start(cb)
        ], cb)
      },
      post: (cb) => {
        parallel([
          (cb) => {
            ipfsdServer.stop()
            cb()
          },
          (cb) => preloadNode.stop(cb)
        ], cb)
      }
    }
  }
}
