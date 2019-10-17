'use strict'

const os = require('os')
const fs = require('fs')
const toUri = require('multiaddr-to-uri')
const { ipfsPathHelp } = require('../utils')
const { isTest } = require('ipfs-utils/src/env')
const debug = require('debug')('ipfs:cli:daemon')

module.exports = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  builder (yargs) {
    return yargs
      .epilog(ipfsPathHelp)
      .option('init-config', {
        type: 'string',
        desc: 'Path to existing configuration file to be loaded during --init.'
      })
      .option('init-profile', {
        type: 'string',
        desc: 'Configuration profiles to apply for --init. See ipfs init --help for more.',
        coerce: (value) => {
          return (value || '').split(',')
        }
      })
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
        default: !isTest // preload by default, unless in test env
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

      let config = {}
      // read and parse config file
      if (argv.initConfig) {
        try {
          const raw = fs.readFileSync(argv.initConfig)
          config = JSON.parse(raw)
        } catch (error) {
          debug(error)
          throw new Error('Default config couldn\'t be found or content isn\'t valid JSON.')
        }
      }

      // Required inline to reduce startup time
      const Daemon = require('../../cli/daemon')
      const daemon = new Daemon({
        config,
        silent: argv.silent,
        repo: process.env.IPFS_PATH,
        offline: argv.offline,
        pass: argv.pass,
        preload: { enabled: argv.enablePreload },
        EXPERIMENTAL: {
          ipnsPubsub: argv.enableNamesysPubsub,
          dht: argv.enableDhtExperiment,
          sharding: argv.enableShardingExperiment
        },
        init: argv.initProfile ? { profiles: argv.initProfile } : true
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
