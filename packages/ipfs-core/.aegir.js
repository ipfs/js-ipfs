import { createServer } from 'ipfsd-ctl'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('aegir').Options["build"]["config"]} */
const esbuild = {
  inject: [path.join(__dirname, '../../scripts/node-globals.js')]
}

/** @type {import('aegir').PartialOptions} */
export default {
  test: {
    browser: {
      config: {
        assets: '..',
        buildConfig: esbuild
      }
    },
    async before (options) {
      const MockPreloadNode = await import('./test/utils/mock-preload-node.js')
      const preloadNode = MockPreloadNode.createNode()
      await preloadNode.start()
      if (options.runner !== 'node') {
        const ipfsdServer = await createServer({
          host: '127.0.0.1',
          port: 57483
        }, {
          type: 'js',
          ipfsModule: await import('./src/index.js'),
          ipfsHttpModule: await import('ipfs-http-client'),
          ipfsBin: path.resolve('../ipfs/src/cli.js'),
          ipfsOptions: {
            libp2p: {
              dialer: {
                dialTimeout: 60e3 // increase timeout because travis is slow
              }
            }
          }
        }, {
          go: {
            ipfsBin: (await import('go-ipfs')).default.path()
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
    bundlesizeMax: '477KB',
    config: esbuild
  }
}
