'use strict'

const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const EchoServer = require('aegir/utils/echo-server')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')
const path = require('path')
const { commonOptions, commonOverrides } = require('./test/utils/factory')

let preloadNode
let echoServer = new EchoServer()

// the second signalling server is needed for the inferface test 'should list peers only once even if they have multiple addresses'
let sigServerA
let sigServerB
let ipfsdServer

module.exports = {
  bundlesize: { maxSize: '530kB' },
  karma: {
    files: [{
      pattern: 'node_modules/interface-ipfs-core/test/fixtures/**/*',
      watched: false,
      served: true,
      included: false
    }],
    browserNoActivityTimeout: 600 * 1000
  },
  webpack: {
    node: {
      // required by the nofilter module
      stream: true,

      // required by the core-util-is module
      Buffer: true
    }
  },
  hooks: {
    node: {
      pre: async () => {
        preloadNode = MockPreloadNode.createNode()

        await preloadNode.start(),
        await echoServer.start()
        return {
          env: {
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: async () => {
        await preloadNode.stop(),
        await echoServer.stop()
      }
    },
    browser: {
      pre: async () => {
        preloadNode = MockPreloadNode.createNode()

        await preloadNode.start()
        await echoServer.start()
        sigServerA = await webRTCStarSigServer.start({
          host: '127.0.0.1',
          port: 14579,
          metrics: false
        })
        sigServerB = await webRTCStarSigServer.start({
          host: '127.0.0.1',
          port: 14578,
          metrics: false
        })

        const url = new URL(commonOptions.endpoint)

        ipfsdServer = await createServer({
          host: url.hostname,
          port: url.port
        }, commonOptions, commonOverrides).start()

        return {
          env: {
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: async () => {
        await ipfsdServer.stop()
        await preloadNode.stop()
        await echoServer.stop()
        await sigServerA.stop()
        await sigServerB.stop()
      }
    }
  }
}
