'use strict'

const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const PinningService = require('./test/utils/mock-pinning-service')
const EchoServer = require('aegir/utils/echo-server')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')
const path = require('path')

let preloadNode
let pinningService
let echoServer = new EchoServer()

// the second signalling server is needed for the interface test 'should list peers only once even if they have multiple addresses'
let sigServerA
let sigServerB
let ipfsdServer

module.exports = {
  bundlesize: { maxSize: '545kB' },
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
        pinningService = await PinningService.start()

        await preloadNode.start(),
        await echoServer.start()
        return {
          env: {
            PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
            PINNING_SERVIEC_KEY: pinningService.token,
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: async () => {
        await preloadNode.stop()
        await PinningService.stop(pinningService)
        await echoServer.stop()
      }
    },
    browser: {
      pre: async () => {
        preloadNode = MockPreloadNode.createNode()
        pinningService = await PinningService.start()

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
        ipfsdServer = await createServer({
          host: '127.0.0.1',
          port: 57483
        }, {
          type: 'js',
          ipfsModule: require(__dirname),
          ipfsHttpModule: require('ipfs-http-client'),
          ipfsBin: path.join(__dirname, 'src', 'cli.js'),
          ipfsOptions: {
            libp2p: {
              dialer: {
                dialTimeout: 60e3 // increase timeout because travis is slow
              }
            }
          }
        }, {
          go: {
            ipfsBin: require('go-ipfs').path()
          },
          js: {
            ipfsClientModule: require('ipfs-client')
          }
        }).start()

        return {
          env: {
            PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
            PINNING_SERVIEC_KEY: pinningService.token,
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
          }
        }
      },
      post: async () => {
        await ipfsdServer.stop()
        await preloadNode.stop()
        await PinningService.stop(pinningService)
        await echoServer.stop()
        await sigServerA.stop()
        await sigServerB.stop()
      }
    }
  }
}
