'use strict'

const os = require('os')
const toUri = require('multiaddr-to-uri')
const { ipfsPathHelp } = require('../utils')

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
      .option('offline', {
        type: 'boolean',
        desc: 'Run offline. Do not connect to the rest of the network but provide local API.',
        default: false
      })
      .option('enable-namesys-pubsub', {
        type: 'boolean',
        default: false
      })
      .option('enable-preload', {
        type: 'boolean',
        default: true
      })
  },

  handler (argv) {
    argv.resolve((async () => {
      const { print } = argv
      print('Initializing IPFS daemon...')
      print(`js-ipfs version: ${require('../../../package.json').version}`)
      print(`System version: ${os.arch()}/${os.platform()}`)
      print(`Node.js version: ${process.versions.node}`)

      const repoPath = argv.getRepoPath()

      // Required inline to reduce startup time
      const Daemon = require('../../cli/daemon')
      const daemon = new Daemon({
        silent: argv.silent,
        repo: process.env.IPFS_PATH,
        offline: argv.offline,
        pass: argv.pass,
        preload: { enabled: argv.enablePreload },
        EXPERIMENTAL: {
          ipnsPubsub: argv.enableNamesysPubsub,
          dht: argv.enableDhtExperiment,
          sharding: argv.enableShardingExperiment
        }
      })

      try {
        await daemon.start()
        daemon._httpApi._apiServers.forEach(apiServer => {
          print(`API listening on ${apiServer.info.ma.toString()}`)
        })
        daemon._httpApi._gatewayServers.forEach(gatewayServer => {
          print(`Gateway (read only) listening on ${gatewayServer.info.ma.toString()}`)
        })
        daemon._httpApi._apiServers.forEach(apiServer => {
          print(`Web UI available at ${toUri(apiServer.info.ma)}/webui`)
        })
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
        print('Received interrupt signal, shutting down...')
        await daemon.stop()
        process.exit(0)
      }

      // listen for graceful termination
      process.on('SIGTERM', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGHUP', cleanup)
    })())
  }
}
