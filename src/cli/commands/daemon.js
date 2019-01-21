'use strict'

const promisify = require('promisify-es6')
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
    argv.resolve((async () => {
      print('Initializing IPFS daemon...')

      const repoPath = utils.getRepoPath()

      // Required inline to reduce startup time
      const HttpAPI = require('../../http')
      httpAPI = new HttpAPI(process.env.IPFS_PATH, null, argv)

      try {
        await promisify(httpAPI.start)()
      } catch (err) {
        if (err.code === 'ENOENT' && err.message.match(/uninitialized/i)) {
          print('Error: no initialized ipfs repo found in ' + repoPath)
          print('please run: jsipfs init')
          process.exit(1)
        }
        throw err
      }

      print('Daemon is ready')

      const cleanup = async () => {
        print(`Received interrupt signal, shutting down..`)
        await promisify(httpAPI.stop)()
        process.exit(0)
      }

      // listen for graceful termination
      process.on('SIGTERM', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGHUP', cleanup)
    })())
  }
}
