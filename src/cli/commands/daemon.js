'use strict'

const Command = require('ronin').Command
const httpAPI = require('../../http-api')
const debug = require('debug')
const log = debug('cli:daemon')
log.error = debug('cli:daemon:error')

module.exports = Command.extend({
  desc: 'Start a long-running daemon process',

  run: (name) => {
    console.log('Initializing daemon...')
    httpAPI.start((err) => {
      if (err) {
        return log.error(err)
      }
      console.log('Daemon is ready')
    })

    process.on('SIGINT', () => {
      console.log('Received interrupt signal, shutting down..')
      httpAPI.stop((err) => {
        if (err) {
          return log.error(err)
        }
        process.exit(0)
      })
    })
  }
})
