'use strict'

const resources = require('./../resources')

module.exports = (server) => {
  const api = server.select('API')

  api.route({
    method: '*',
    path: '/api/v0/key/list',
    handler: resources.key.list
  })

  api.route({
    method: '*',
    path: '/api/v0/key/gen',
    handler: resources.key.gen
  })

  api.route({
    method: '*',
    path: '/api/v0/key/rm',
    handler: resources.key.rm
  })

  api.route({
    method: '*',
    path: '/api/v0/key/rename',
    handler: resources.key.rename
  })
}
