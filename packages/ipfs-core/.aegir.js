'use strict'

const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
const path = require('path')

let preloadNode = MockPreloadNode.createNode()
let ipfsdServer

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

module.exports = {
  test: {
    browser :{
      config: {
        assets: '..',
        buildConfig: esbuild
      }
    }
  },
  build: {
    bundlesizeMax: '545kB',
    config: esbuild
  },
  hooks: {
    node: {
      pre: async () => {
        await preloadNode.start()
      },
      post: async () => {
        await preloadNode.stop()
      }
    },
    browser: {
      pre: async () => {
        await preloadNode.start()
        ipfsdServer = await createServer({
          host: '127.0.0.1',
          port: 57483
        }, {
          type: 'js',
          ipfsModule: require(__dirname),
          ipfsHttpModule: require(path.join(__dirname, '..', 'ipfs-http-client')),
          ipfsBin: path.resolve(path.join(__dirname, '..', 'ipfs', 'src', 'cli.js')),
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
          }
        }).start()
      },
      post: async () => {
        await ipfsdServer.stop()
        await preloadNode.stop()
      }
    }
  }
}
