'use strict'

const resources = require('../resources')

module.exports = {
  method: '*',
  path: '/api/v0/id',
  handler: resources.id.get
}
