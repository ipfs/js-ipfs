'use strict'

const resources = require('./../resources')

// TODO
module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: 'GET',
    path: '/api/v0/repo',
    handler: resources.repo
  })
}
