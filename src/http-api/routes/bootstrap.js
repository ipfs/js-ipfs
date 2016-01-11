'use strict'

const server = require('./../index.js').server
const resources = require('./../resources')

server.route({
  method: 'GET',
  path: '/api/v0/bootstrap',
  handler: resources.version.list
})

server.route({
  method: 'POST',
  path: '/api/v0/bootstrap',
  handler: resources.version.add
})

server.route({
  method: 'DELETE',
  path: '/api/v0/bootstrap',
  handler: resources.version.add
})
