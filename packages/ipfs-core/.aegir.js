'use strict'

const { createServer } = require('ipfsd-ctl')
const MockPreloadNode = require('./test/utils/mock-preload-node')
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
    async before (options) {
      const preloadNode = MockPreloadNode.createNode()
      await preloadNode.start()
      if (options.runner !== 'node') {
        const ipfsdServer = await createServer({
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
        return {
          ipfsdServer,
          preloadNode
        }
      }

      return {
        preloadNode
      }
    },
    async after (options, before) {
      await before.preloadNode.stop()
      if (options.runner !== 'node') {
        await before.ipfsdServer.stop()
      }
    }
  },
  build: {
    bundlesizeMax: '610kB',
    config: esbuild
  }
}
