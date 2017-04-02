'use strict'

const HttpAPI = require('../../http-api')
const utils = require('../utils')

let httpAPI

module.exports = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  builder: {
    'enable-sharding-experiment': {
      type: 'boolean',
      default: false
    },
    'enable-pubsub-experiment': {
      type: 'booleam',
      default: false
    }
  },

  handler (argv) {
    console.log('Initializing daemon...')

    const repoPath = utils.getRepoPath()
    httpAPI = new HttpAPI(process.env.IPFS_PATH, argv)

    httpAPI.start((err) => {
      if (err && err.code === 'ENOENT') {
        console.log('Error: no ipfs repo found in ' + repoPath)
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
