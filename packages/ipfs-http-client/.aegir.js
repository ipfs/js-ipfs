'use strict'

const { createServer } = require('ipfsd-ctl')
const getPort = require('aegir/utils/get-port')

/** @type {import('aegir').PartialOptions} */
module.exports = {
  build: {
    bundlesizeMax: '89KB'
  },
  test: {
    async before (options) {
      const port = await getPort()
      const server = createServer({
        host: '127.0.0.1',
        port: port
      }, {
        type: 'go',
        ipfsHttpModule: require('./'),
        ipfsBin: require('go-ipfs').path()
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
