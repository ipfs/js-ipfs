'use strict'

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
