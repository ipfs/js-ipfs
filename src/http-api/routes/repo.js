'use strict'

const resources = require('./../resources')

// TODO
module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/repo',
    handler: resources.repo
  })
}
