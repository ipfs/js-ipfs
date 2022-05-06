import { createServer } from 'ipfsd-ctl'
import getPort from 'aegir/get-port'

/** @type {import('aegir').PartialOptions} */
export default {
  build: {
    bundlesizeMax: '66KB'
  },
  test: {
    async before (options) {
      const port = await getPort()
      const server = createServer({
        host: '127.0.0.1',
        port: port
      }, {
        type: 'go',
        ipfsHttpModule: await import('./src/index.js'),
        ipfsBin: (await import('go-ipfs')).default.path()
      })

      await server.start()
      return {
        server,
        env: {
          IPFSD_SERVER: `http://${server.host}:${server.port}`
        }
      }
    },
    async after (options, before) {
      await before.server.stop()
    }
  }
}
