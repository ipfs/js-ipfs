'use strict'

const { gateway } = require('ipfs-http-gateway/src/resources')

const webuiCid = 'bafybeigkbbjnltbd4ewfj7elajsbnjwinyk6tiilczkqsibf3o7dcr6nn4' // v2.9.0

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
    handler (_request, h) {
      return h.redirect(`/ipfs/${webuiCid}/`)
    }
  }
]
