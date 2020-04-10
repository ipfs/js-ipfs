'use strict'

const resources = require('../resources')

module.exports = {
  method: 'POST',
  path: '/api/v0/ping',
  config: {
    handler: resources.ping.handler,
    validate: resources.ping.validate
  }
}
