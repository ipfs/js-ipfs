'use strict'

const IPFSFactory = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')

const ipfsdServer = IPFSFactory.createServer()
const preloadNode = MockPreloadNode.createNode()
const echoServer = EchoServer.createServer()

module.exports = {
  bundlesize: { maxSize: '652kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main'],
      aliasFields: ['browser', 'browser-all-ipld-formats'],
    }
  },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 100 * 1000,
  },
  hooks: {
    node: {
      pre: () => Promise.all([
        preloadNode.start(),
        echoServer.start()
      ]),
      post: () => Promise.all([
        preloadNode.stop(),
        echoServer.stop()
      ])
    },
    browser: {
      pre: () => Promise.all([
        ipfsdServer.start(),
        preloadNode.start(),
        echoServer.start()
      ]),
      post: () => Promise.all([
        ipfsdServer.stop(),
        preloadNode.stop(),
        echoServer.stop()
      ])
    }
  }
}
