const api = require('./../index.js').server.select('API')
const resources = require('./../resources')

// TODO

api.route({
  method: 'GET',
  path: '/api/v0/block',
  handler: resources.block
})
