'use strict'

const api = require('./../index.js').server.select('API')
const resources = require('./../resources')

api.route({
  method: 'GET',
  path: '/api/v0/version',
  handler: resources.version.get
})
