'use strict'

const resources = require('../resources')

module.exports = {
  // TODO fix method
  method: '*',
  path: '/api/v0/file/ls',
  config: {
    pre: [
      { method: resources.file.ls.parseArgs, assign: 'args' }
    ]
  },
  handler: resources.file.ls.handler
}
