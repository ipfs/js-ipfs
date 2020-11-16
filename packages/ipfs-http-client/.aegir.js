'use strict'

const { createServer } = require('ipfsd-ctl')

const server = createServer({
  host: '127.0.0.1',
  port: 48372
}, {
  type: 'go',
  ipfsHttpModule: require('./'),
  ipfsBin: require('go-ipfs').path()
})

module.exports = {
  bundlesize: { maxSize: '83kB' },
  hooks: {
    browser: {
      pre: async () => {
        await server.start()
      },
      post: async () => {
        await server.stop()
      }
    }
  }
}
