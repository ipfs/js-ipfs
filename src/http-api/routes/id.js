'use strict'

const api = require('./../index.js').server.select('API')
const resources = require('./../resources')

api.route({
  method: 'GET',
  path: '/api/v0/id',
  handler: resources.id.get
})
