'use strict'

const multiaddr = require('multiaddr')
const debug = require('debug')
const log = debug('ipfs:webui:info')
log.error = debug('ipfs:webui:error')

module.exports = [
  {
    method: '*',
    path: '/webui',
    async handler (request, h) {
      let scheme = 'http'
      let port
      let host

      try {
        const { ipfs } = request.server.app
        const gateway = await ipfs.config.get('Addresses.Gateway')
        const address = multiaddr(gateway).nodeAddress()

        port = address.port
        host = address.host
      } catch (err) {
        // may not have gateway configured
        log.error(err)

        scheme = 'https'
        port = 443
        host = 'gateway.ipfs.io'
      }

      return h.redirect(`${scheme}://${host}:${port}/ipfs/QmfNbSskgvTXYhuqP8tb9AKbCkyRcCy3WeiXwD9y5LeoqK`)
    }
  }
]
