'use strict'

const resources = require('../resources')

module.exports = {
  method: '*',
  path: '/api/v0/resolve',
  options: {
    validate: resources.resolve.validate
  },
  handler: resources.resolve.handler
}
