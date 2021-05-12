'use strict'

const fs = require('fs')
const debug = require('debug')('ipfs:cli:init')
const { ipfsPathHelp } = require('../utils')

module.exports = {
  command: 'init [default-config] [options]',
  describe: 'Initialize a local IPFS node\n\n' +
    'If you are going to run IPFS in a server environment, you may want to ' +
    'initialize it using the \'server\' profile.\n\n' +
    'For the list of available profiles run `jsipfs config profile ls`',

  /**
   * @param {import('yargs').Argv} yargs
   */
  builder (yargs) {
    return yargs
      .epilog(ipfsPathHelp)
      .positional('default-config', {
        describe: 'Node config, this should be a path to a file or JSON and will be merged with the default config. See https://github.com/ipfs/js-ipfs#optionsconfig',
        type: 'string'
      })
      .option('algorithm', {
        type: 'string',
        alias: 'a',
        default: 'RSA',
        describe: 'Cryptographic algorithm to use for key generation. Supports [RSA, Ed25519, secp256k1]'
      })
      .option('bits', {
        type: 'number',
        alias: 'b',
        default: '2048',
        describe: 'Number of bits to use in the generated RSA private key (defaults to 2048)',
        coerce: Number
      })
      .option('empty-repo', {
        alias: 'e',
        type: 'boolean',
        describe: "Don't add and pin help files to the local storage"
      })
      .option('private-key', {
        alias: 'k',
        type: 'string',
        describe: 'Pre-generated private key to use for the repo'
      })
      .option('profile', {
        alias: 'p',
        type: 'string',
        describe: 'Apply profile settings to config. Multiple profiles can be separated by \',\'',
        coerce: (value) => {
          return (value || '').split(',')
        }
      })
  },

  /**
   * @param {object} argv
   * @param {import('../types').Context} argv.ctx
   * @param {string} argv.defaultConfig
   * @param {'RSA' | 'Ed25519' | 'secp256k1'} argv.algorithm
   * @param {number} argv.bits
   * @param {boolean} argv.emptyRepo
   * @param {string} argv.privateKey
   * @param {string[]} argv.profile
   * @param {string} argv.pass
   */
  async handler (argv) {
    const { print, repoPath } = argv.ctx
    let config = {}
    // read and parse config file
    if (argv.defaultConfig) {
      try {
        const raw = fs.readFileSync(argv.defaultConfig, { encoding: 'utf8' })
        config = JSON.parse(raw)
      } catch (error) {
        debug(error)
        throw new Error('Default config couldn\'t be found or content isn\'t valid JSON.')
      }
    }

    print(`initializing ipfs node at ${repoPath}`)

    // Required inline to reduce startup time
    const IPFS = require('ipfs-core')
    const Repo = require('ipfs-repo')

    try {
      await IPFS.create({
        repo: new Repo(repoPath),
        init: {
          algorithm: argv.algorithm,
          bits: argv.bits,
          privateKey: argv.privateKey,
          emptyRepo: argv.emptyRepo,
          profiles: argv.profile
        },
        pass: argv.pass,
        start: false,
        // @ts-ignore - Expects more than {}
        config
      })
    } catch (err) {
      if (err.code === 'EACCES') {
        err.message = 'EACCES: permission denied, stat $IPFS_PATH/version'
      }
      throw err
    }
  }
}
