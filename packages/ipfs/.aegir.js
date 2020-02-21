'use strict'

const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const EchoServer = require('interface-ipfs-core/src/utils/echo-http-server')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')
const path = require('path')
const webpack = require('webpack')

let preloadNode
let echoServer

// the second signalling server is needed for the inferface test 'should list peers only once even if they have multiple addresses'
let sigServerA
let sigServerB
let ipfsdServer

module.exports = {
  bundlesize: { maxSize: '652kB' },
  webpack: {
    resolve: {
      mainFields: ['browser', 'main'],
      aliasFields: ['browser', 'browser-all-ipld-formats'],
    },
    ...(process.env.NODE_ENV === 'test' ? {
      plugins: [
        new webpack.EnvironmentPlugin(['DEBUG', 'ECHO_SERVER_PORT'])
      ]
    } : {})
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
        preloadNode = MockPreloadNode.createNode()
        echoServer = EchoServer.createServer()

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
        preloadNode = MockPreloadNode.createNode()
        echoServer = EchoServer.createServer()

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
          port: 43134
        }, {
          type: 'js',
          ipfsModule: require(__dirname),
          ipfsHttpModule: require('ipfs-http-client'),
          ipfsBin: path.join(__dirname, 'src', 'cli', 'bin.js'),
          ipfsOptions: {
            config: {
              libp2p: {
                dialer: {
                  dialTimeout: 60e3 // increase timeout because travis is slow
                }
              }
            }
          }
        }, {
          go: {
            ipfsBin: require('go-ipfs-dep').path()
          }
        }).start()
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
