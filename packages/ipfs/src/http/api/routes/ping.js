'use strict'

const resources = require('../resources')

module.exports = {
  method: '*',
  path: '/api/v0/ping',
  config: {
    handler: resources.ping.handler,
    validate: resources.ping.validate
  }
}
