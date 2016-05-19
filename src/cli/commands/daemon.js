'use strict'

const Command = require('ronin').Command
const HttpAPI = require('../../http-api')
const debug = require('debug')
const log = debug('cli:daemon')
log.error = debug('cli:daemon:error')

let httpAPI

module.exports = Command.extend({
  desc: 'Start a long-running daemon process',

  run: (name) => {
    console.log('Initializing daemon...')
    httpAPI = new HttpAPI(process.env.IPFS_PATH)
    httpAPI.start((err) => {
      if (err) {
        throw err
      }
      console.log('Daemon is ready')
    })

    process.on('SIGINT', () => {
      console.log('Received interrupt signal, shutting down..')
      httpAPI.stop((err) => {
        if (err) {
          throw err
        }
        process.exit(0)
      })
    })
  }
})
