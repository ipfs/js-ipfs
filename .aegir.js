'use strict'

const IPFSFactory = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')

const ipfsdServer = IPFSFactory.createServer()
const preloadNode = MockPreloadNode.createNode()
const echoServer = EchoServer.createServer()
let sigServer

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
      pre: async () => {
        await preloadNode.start(),
        await echoServer.start()
      },
      post: async () => {
        await preloadNode.stop(),
        await echoServer.stop()

      }
    },
    browser: {
      pre: async () => {
          await ipfsdServer.start()
          await preloadNode.start()
          await echoServer.start()
          sigServer = await webRTCStarSigServer.start({
            host: '127.0.0.1',
            port: 14579
          })
      },
      post: async () => {
          await ipfsdServer.stop()
          await preloadNode.stop()
          await echoServer.stop()
          await sigServer.stop()
      }
    }
  }
}
