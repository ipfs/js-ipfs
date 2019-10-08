'use strict'

const multiaddr = require('multiaddr')

module.exports = [
  {
    method: '*',
    path: '/webui',
    async handler (request, h) {
      const { ipfs } = request.server.app
      const gateway = await ipfs.config.get('Addresses.Gateway')
      const addr = multiaddr(gateway)
      const {
        port,
        address
      } = addr.nodeAddress()

      return h.redirect(`http://${address}:${port}/ipns/webui.ipfs.io`)
    }
  }
]
