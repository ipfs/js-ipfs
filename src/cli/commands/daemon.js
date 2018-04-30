'use strict'

const HttpAPI = require('../../http')
const utils = require('../utils')
const promisify = require('promisify-es6')
const print = utils.print

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
  },

  handler (argv) {
    print('Initializing daemon...')

    const httpAPI = new HttpAPI(process.env.IPFS_PATH, null, argv)
    const start = promisify(httpAPI.start)
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

    return start().then(() => print('Daemon is ready'))
  }
}
