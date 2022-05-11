import os from 'os'
import fs from 'fs'
import { multiaddrToUri } from '@multiformats/multiaddr-to-uri'
import { ipfsPathHelp } from '../utils.js'
import { isTest } from 'ipfs-utils/src/env.js'
import { logger } from '@libp2p/logger'
import { Daemon } from 'ipfs-daemon'

const log = logger('ipfs:cli:daemon')

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} [Argv.initConfig]
 * @property {string[]} [Argv.initProfile]
 * @property {boolean} Argv.enableShardingExperiment
 * @property {boolean} Argv.offline
 * @property {boolean} Argv.enableNamesysPubsub
 * @property {boolean} Argv.enablePreload
 * @property {boolean} Argv.silent
 * @property {boolean} Argv.migrate
 * @property {string} Argv.pass
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  builder (yargs) {
    yargs
      .epilog(ipfsPathHelp)
      .option('init-config', {
        string: true,
        desc: 'Path to existing configuration file to be loaded during --init.'
      })
      .option('init-profile', {
        string: true,
        desc: 'Configuration profiles to apply for --init. See ipfs init --help for more',
        coerce: (value) => {
          return (value || '').split(',')
        }
      })
      .option('enable-sharding-experiment', {
        boolean: true,
        default: false
      })
      .option('offline', {
        boolean: true,
        desc: 'Run offline. Do not connect to the rest of the network but provide local API',
        default: false
      })
      .option('enable-namesys-pubsub', {
        boolean: true,
        default: false
      })
      .option('enable-preload', {
        boolean: true,
        default: !isTest // preload by default, unless in test env
      })

    return yargs
  },

  async handler ({ ctx: { print, repoPath }, initConfig, silent, migrate, offline, pass, enablePreload, enableNamesysPubsub, enableShardingExperiment, initProfile }) {
    print('Initializing IPFS daemon...')
    print(`System version: ${os.arch()}/${os.platform()}`)
    print(`Node.js version: ${process.versions.node}`)

    let config = {}
    // read and parse config file
    if (initConfig) {
      try {
        const raw = fs.readFileSync(initConfig, { encoding: 'utf8' })
        config = JSON.parse(raw)
      } catch (/** @type {any} */ error) {
        log(error)
        throw new Error('Default config couldn\'t be found or content isn\'t valid JSON.')
      }
    }

    const daemon = new Daemon({
      config,
      silent: silent,
      repo: process.env.IPFS_PATH,
      repoAutoMigrate: migrate,
      offline: offline,
      pass: pass,
      preload: { enabled: enablePreload },
      EXPERIMENTAL: {
        ipnsPubsub: enableNamesysPubsub,
        sharding: enableShardingExperiment
      },
      init: initProfile ? { profiles: initProfile } : undefined
    })

    try {
      await daemon.start()

      const version = await daemon._ipfs.version()

      print(`js-ipfs version: ${version.version}`)

      if (daemon._httpApi && daemon._httpApi._apiServers) {
        daemon._httpApi._apiServers.forEach(apiServer => {
          print(`HTTP API listening on ${apiServer.info.ma}`)
        })
      }

      if (daemon._grpcServer && daemon._grpcServer) {
        print(`gRPC listening on ${daemon._grpcServer.info.ma}`)
      }

      if (daemon._httpGateway && daemon._httpGateway._gatewayServers) {
        daemon._httpGateway._gatewayServers.forEach(gatewayServer => {
          print(`Gateway (read only) listening on ${gatewayServer.info.ma}`)
        })
      }

      if (daemon._httpApi && daemon._httpApi._apiServers) {
        daemon._httpApi._apiServers.forEach(apiServer => {
          print(`Web UI available at ${multiaddrToUri(apiServer.info.ma)}/webui`)
        })
      }
    } catch (/** @type {any} */ err) {
      if (err.code === 'ERR_REPO_NOT_INITIALIZED' || err.message.match(/uninitialized/i)) {
        err.message = 'no initialized ipfs repo found in ' + repoPath + '\nplease run: jsipfs init'
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
  }
}

export default command
