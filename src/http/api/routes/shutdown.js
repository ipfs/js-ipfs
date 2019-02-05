'use strict'

const resources = require('../resources')

module.exports = {
  method: '*',
  path: '/api/v0/shutdown',
  handler: resources.shutdown
}
