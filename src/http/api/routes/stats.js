'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/stats/bitswap',
    config: {
      handler: resources.stats.bitswap.handler
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/stats/repo',
    config: {
      handler: resources.stats.repo
    }
  })

  api.route({
    method: '*',
    path: '/api/v0/stats/bw',
    config: {
      handler: resources.stats.bw
    }
  })
}
