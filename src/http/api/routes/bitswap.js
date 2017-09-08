'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/bitswap/wantlist',
    config: {
      handler: resources.bitswap.wantlist
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/bitswap/stat',
    config: {
      handler: resources.bitswap.stat
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/bitswap/unwant',
    config: {
      pre: [
        { method: resources.bitswap.unwant.parseArgs, assign: 'args' }
      ],
      handler: resources.bitswap.unwant.handler
    }
  })
}
