'use strict'

const HttpAPI = require('../../http-api')
const debug = require('debug')
const log = debug('cli:daemon')
log.error = debug('cli:daemon:error')

let httpAPI

module.exports = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  handler () {
    console.log('Initializing daemon...')

    httpAPI = new HttpAPI(process.env.IPFS_PATH)

    httpAPI.start((err) => {
      if (err && err.code === 'ENOENT') {
        console.log('Error: no ipfs repo found in ' + process.env.IPFS_PATH)
        console.log('please run: jsipfs init')
        process.exit(1)
      }
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
}
