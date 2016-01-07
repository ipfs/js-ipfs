var server = require('./../index.js').server
var resources = require('./../resources')

server.route({
  method: 'GET',
  path: '/api/v0/version',
  handler: resources.version.get
})
