'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/cat',
    config: {
      pre: [
        { method: resources.files.cat.parseArgs, assign: 'args' }
      ],
      handler: resources.files.cat.handler
    }
  })
}
