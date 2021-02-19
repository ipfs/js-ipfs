'use strict'

const getPort = require('aegir/utils/get-port')
const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const PinningService = require('./test/utils/mock-pinning-service')
const EchoServer = require('aegir/utils/echo-server')
const webRTCStarSigServer = require('libp2p-webrtc-star/src/sig-server')
const path = require('path')

/** @type {import('aegir').Options["build"]["config"]} */
const esbuild = {
  inject: [path.join(__dirname, '../../scripts/node-globals.js')],
  plugins: [
    {
      name: 'node built ins',
      setup (build) {
        build.onResolve({ filter: /^stream$/ }, () => {
          return { path: require.resolve('readable-stream') }
        })
      }
    }
  ]
}

/** @type {import('aegir').PartialOptions} */
module.exports = {
  test: {
    browser: {
      config: {
        assets: '..',
        buildConfig: esbuild
      }
    },
    before: async (options) => {
      const echoServer = new EchoServer()
      const preloadNode = MockPreloadNode.createNode()
      const pinningService = await PinningService.start()

      await preloadNode.start()
      await echoServer.start()

      if (options.runner !== 'node') {
        const ipfsdPort = await getPort()
        const signalAPort = await getPort()
        const signalBPort = await getPort()
        const sigServerA = await webRTCStarSigServer.start({
          host: '127.0.0.1',
          port: signalAPort,
          metrics: false
        })
        // the second signalling server is needed for the interface test 'should list peers only once even if they have multiple addresses'
        const sigServerB = await webRTCStarSigServer.start({
          host: '127.0.0.1',
          port: signalBPort,
          metrics: false
        })
        const ipfsdServer = await createServer({
          host: '127.0.0.1',
          port: ipfsdPort
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
            ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`,
            IPFSD_SERVER: `http://127.0.0.1:${ipfsdPort}`,
            SIGNALA_SERVER: `/ip4/127.0.0.1/tcp/${signalAPort}/ws/p2p-webrtc-star`,
            SIGNALB_SERVER: `/ip4/127.0.0.1/tcp/${signalBPort}/ws/p2p-webrtc-star`
          },
          echoServer,
          preloadNode,
          pinningService,
          ipfsdServer,
          sigServerA,
          sigServerB
        }
      }
      return {
        env: {
          PINNING_SERVICE_ENDPOINT: pinningService.endpoint,
          PINNING_SERVIEC_KEY: pinningService.token,
          ECHO_SERVER: `http://${echoServer.host}:${echoServer.port}`
        },
        echoServer,
        preloadNode,
        pinningService
      }
    },
    after: async (options, beforeResult) => {
      await beforeResult.echoServer.stop()
      await beforeResult.preloadNode.stop()
      await PinningService.stop(beforeResult.pinningService)
      if (options.runner !== 'node') {
        await beforeResult.ipfsdServer.stop()
        await beforeResult.sigServerA.stop()
        await beforeResult.sigServerB.stop()
      }
    }
  },
  build: {
    bundlesizeMax: '610kB',
    config: esbuild
  },
  dependencyCheck: {
    ignore: [
      'assert',
      'cross-env',
      'rimraf',
      'url',
      'wrtc',
      'electron-webrtc',
      'ipfs-interop'
    ]
  }
}
