'use strict'

const Command = require('ronin').Command
const httpAPI = require('../../http-api')
const debug = require('debug')
let log = debug('cli:daemon')
log.error = debug('cli:damon:error')

module.exports = Command.extend({
  desc: 'Start a long-running daemon process',

  run: name => {
    httpAPI.start((err) => {
      if (err) { return log.error(err) }
      log('daemon started')
    })
  }
})
