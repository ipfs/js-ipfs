'use strict'

const resources = require('../resources')

module.exports = {
  method: 'POST',
  path: '/api/v0/resolve',
  ...resources.resolve
}
