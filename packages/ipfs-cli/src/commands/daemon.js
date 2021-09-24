import os from 'os'
import fs from 'fs'
// @ts-expect-error no types
import toUri from 'multiaddr-to-uri'
import { ipfsPathHelp } from '../utils.js'
import { isTest } from 'ipfs-utils/src/env.js'
import debug from 'debug'
import { Daemon } from 'ipfs-daemon'

const log = debug('ipfs:cli:daemon')

export default {
  command: 'daemon',

  describe: 'Start a long-running daemon process',

  /**
   * @param {import('yargs').Argv} yargs
   */
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

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {string} [argv.initConfig]
   * @param {string[]} [argv.initProfile]
   * @param {boolean} argv.enableShardingExperiment
   * @param {boolean} argv.offline
   * @param {boolean} argv.enableNamesysPubsub
   * @param {boolean} argv.enablePreload
   * @param {boolean} argv.silent
   * @param {boolean} argv.migrate
   * @param {string} argv.pass
   */
  async handler (argv) {
    const { print, repoPath } = argv.ctx
    print('Initializing IPFS daemon...')
    print(`System version: ${os.arch()}/${os.platform()}`)
    print(`Node.js version: ${process.versions.node}`)

    let config = {}
    // read and parse config file
    if (argv.initConfig) {
      try {
        const raw = fs.readFileSync(argv.initConfig, { encoding: 'utf8' })
        config = JSON.parse(raw)
      } catch (/** @type {any} */ error) {
        log(error)
        throw new Error('Default config couldn\'t be found or content isn\'t valid JSON.')
      }
    }

    const daemon = new Daemon({
      config,
      silent: argv.silent,
      repo: process.env.IPFS_PATH,
      repoAutoMigrate: argv.migrate,
      offline: argv.offline,
      pass: argv.pass,
      preload: { enabled: argv.enablePreload },
      EXPERIMENTAL: {
        ipnsPubsub: argv.enableNamesysPubsub,
        sharding: argv.enableShardingExperiment
      },
      init: argv.initProfile ? { profiles: argv.initProfile } : undefined
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

      // @ts-ignore - _httpGateway is possibly undefined
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
          print(`Web UI available at ${toUri(apiServer.info.ma)}/webui`)
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
