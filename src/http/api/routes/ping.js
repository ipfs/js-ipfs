'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/ping',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      handler: resources.ping.get
    }
  })
}
