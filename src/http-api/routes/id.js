'use strict'

const server = require('./../index.js').server
const resources = require('./../resources')

server.route({
  method: 'GET',
  path: '/api/v0/id',
  handler: resources.id.get
})
