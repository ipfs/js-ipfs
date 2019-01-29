'use strict'

const { getRepoPath, print, ipfsPathHelp } = require('../utils')

module.exports = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  builder (yargs) {
    return yargs
      .epilog(ipfsPathHelp)
      .option('enable-sharding-experiment', {
        type: 'boolean',
        default: false
      })
      .option('enable-pubsub-experiment', {
        type: 'boolean',
        default: false
      })
      .option('offline', {
        desc: 'Run offline. Do not connect to the rest of the network but provide local API.',
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

      const repoPath = getRepoPath()

      // Required inline to reduce startup time
      const HttpApi = require('../../http')
      const api = new HttpApi({
        silent: argv.silent,
        repo: process.env.IPFS_PATH,
        offline: argv.offline,
        pass: argv.pass,
        EXPERIMENTAL: {
          pubsub: argv.enablePubsubExperiment,
          ipnsPubsub: argv.enableNamesysPubsub,
          dht: argv.enableDhtExperiment,
          sharding: argv.enableShardingExperiment
        }
      })

      try {
        await api.start()
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
        print(`Received interrupt signal, shutting down...`)
        await api.stop()
        process.exit(0)
      }

      // listen for graceful termination
      process.on('SIGTERM', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGHUP', cleanup)
    })())
  }
}
