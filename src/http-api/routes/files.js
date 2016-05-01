'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/add',
    config: {
      payload: {
        parse: false,
        output: 'stream'
      },
      pre: [
        { method: resources.files.add.parseArgs, assign: 'args' }
      ],
      handler: resources.files.add.handler
    }
  })
}
