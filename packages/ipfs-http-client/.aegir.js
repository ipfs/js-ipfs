'use strict'

const { createServer } = require('ipfsd-ctl')
const getPort = require('aegir/utils/get-port')

let server

module.exports = {
  build: {
    bundlesizeMax: '98kB',
  },
  hooks: {
    browser: {
      pre: async () => {
        const port = await getPort()
        server = createServer({
          host: '127.0.0.1',
          port: port
        }, {
          type: 'go',
          ipfsHttpModule: require('./'),
          ipfsBin: require('go-ipfs').path()
        })

        await server.start()
        return {
          env: {
            IPFSD_SERVER : `http://${server.host}:${server.port}`
          }
        }
      },
      post: async () => {
        await server.stop()
      }
    }
  }
}
