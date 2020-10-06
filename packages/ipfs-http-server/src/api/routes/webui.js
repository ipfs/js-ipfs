'use strict'

const debug = require('debug')
const { gateway } = require('ipfs-http-gateway/src/resources')
const log = debug('ipfs:webui:info')
log.error = debug('ipfs:webui:error')

const webuiCid = 'bafybeigv2xkwu2v27rx56m7ndg5dnz4b7235pn33andlriqhyy5s6nwyvq' // v2.11.3

module.exports = [
  {
    method: 'GET',
    path: `/ipfs/${webuiCid}/{path*}`, // only the whitelisted webui is allowed on API port
    options: {
      handler: gateway.handler,
      response: {
        ranges: false // disable built-in support, handler does it manually
      },
      ext: {
        onPostHandler: { method: gateway.afterHandler }
      }
    }
  },
  {
    method: 'GET',
    path: '/webui/{slug?}', // optional slug makes it work with and without slash
    handler (request, h) {
      return h.redirect(`/ipfs/${webuiCid}/`)
    }
  }
]
