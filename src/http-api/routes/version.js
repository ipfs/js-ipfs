'use strict'

const server = require('./../index.js').server
const resources = require('./../resources')

server.route({
  method: 'GET',
  path: '/api/v0/version',
  handler: resources.version.get
})
