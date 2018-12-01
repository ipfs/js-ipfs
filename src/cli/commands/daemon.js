'use strict'

const utils = require('../utils')
const print = utils.print

let httpAPI

module.exports = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  builder (yargs) {
    return yargs
      .epilog(utils.ipfsPathHelp)
      .option('enable-sharding-experiment', {
        type: 'boolean',
        default: false
      })
      .option('enable-pubsub-experiment', {
        type: 'boolean',
        default: false
      })
      .option('enable-dht-experiment', {
        type: 'boolean',
        default: false
      })
      .option('local', {
        desc: 'Run commands locally to the daemon',
        default: false
      })
      .option('enable-namesys-pubsub', {
        type: 'boolean',
        default: false
      })
  },

  handler (argv) {
    print('Initializing IPFS daemon...')

    const repoPath = utils.getRepoPath()

    // Required inline to reduce startup time
    const HttpAPI = require('../../http')
    httpAPI = new HttpAPI(process.env.IPFS_PATH, null, argv)

    httpAPI.start((err) => {
      if (err && err.code === 'ENOENT' && err.message.match(/uninitialized/i)) {
        print('Error: no initialized ipfs repo found in ' + repoPath)
        print('please run: jsipfs init')
        process.exit(1)
      }
      if (err) {
        throw err
      }
      print('Daemon is ready')
    })

    const cleanup = () => {
      print(`Received interrupt signal, shutting down..`)
      httpAPI.stop((err) => {
        if (err) {
          throw err
        }
        process.exit(0)
      })
    }

    // listen for graceful termination
    process.on('SIGTERM', cleanup)
    process.on('SIGINT', cleanup)
    process.on('SIGHUP', cleanup)
  }
}
