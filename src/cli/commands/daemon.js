'use strict'

const HttpAPI = require('../../http-api')
const utils = require('../utils')
const print = utils.print

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
      type: 'boolean',
      default: false
    }
  },

  handler (argv) {
    print('Initializing daemon...')

    const repoPath = utils.getRepoPath()
    httpAPI = new HttpAPI(process.env.IPFS_PATH, null, argv)

    httpAPI.start((err) => {
      if (err && err.code === 'ENOENT' && err.message.match(/Uninitalized repo/i)) {
        print('Error: no initialized ipfs repo found in ' + repoPath)
        print('please run: jsipfs init')
        process.exit(1)
      }
      if (err) {
        throw err
      }
      print('Daemon is ready')
    })

    process.on('SIGINT', () => {
      print('Received interrupt signal, shutting down..')
      httpAPI.stop((err) => {
        if (err) {
          throw err
        }
        process.exit(0)
      })
    })
  }
}
