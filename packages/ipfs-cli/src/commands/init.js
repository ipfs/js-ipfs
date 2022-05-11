import fs from 'fs'
import { logger } from '@libp2p/logger'
import { ipfsPathHelp } from '../utils.js'
import * as IPFS from 'ipfs-core'

const log = logger('ipfs:cli:init')

/** @type {Record<string, import('@libp2p/crypto/keys').KeyTypes>} */
const keyTypes = {
  ed25519: 'Ed25519',
  rsa: 'RSA'
}

/**
 * @typedef {object} Argv
 * @property {import('../types').Context} Argv.ctx
 * @property {string} Argv.defaultConfig
 * @property {'rsa' | 'ed25519' | 'secp256k1'} Argv.algorithm
 * @property {number} Argv.bits
 * @property {boolean} Argv.emptyRepo
 * @property {string} Argv.privateKey
 * @property {string[]} Argv.profile
 * @property {string} Argv.pass
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'init [defaultConfig]',
  describe: 'Initialize a local IPFS node. If you are going to run IPFS in a server environment, you may want to initialize it using the \'server\' profile. For the list of available profiles run `jsipfs config profile ls`. ' + ipfsPathHelp,

  builder: {
    defaultConfig: {
      describe: 'Node config, this should be a path to a file or JSON and will be merged with the default config. See https://github.com/ipfs/js-ipfs#optionsconfig',
      string: true
    },
    algorithm: {
      string: true,
      choices: Object.keys(keyTypes),
      alias: 'a',
      default: 'ed25519',
      describe: 'Cryptographic algorithm to use for key generation'
    },
    bits: {
      number: true,
      alias: 'b',
      default: '2048',
      describe: 'Number of bits to use if the generated private key is RSA (defaults to 2048)',
      coerce: Number
    },
    emptyRepo: {
      alias: 'e',
      boolean: true,
      describe: "Don't add and pin help files to the local storage"
    },
    privateKey: {
      alias: 'k',
      string: true,
      describe: 'Pre-generated private key to use for the repo'
    },
    profile: {
      alias: 'p',
      string: true,
      describe: 'Apply profile settings to config. Multiple profiles can be separated by \',\'',
      coerce: (value) => {
        return (value || '').split(',')
      }
    }
  },

  async handler ({ ctx: { print, repoPath }, defaultConfig, algorithm, bits, privateKey, emptyRepo, profile, pass }) {
    let config = {}
    // read and parse config file
    if (defaultConfig) {
      try {
        const raw = fs.readFileSync(defaultConfig, { encoding: 'utf8' })
        config = JSON.parse(raw)
      } catch (/** @type {any} */ error) {
        log(error)
        throw new Error('Default config couldn\'t be found or content isn\'t valid JSON.')
      }
    }

    print(`initializing ipfs node at ${repoPath}`)

    try {
      await IPFS.create({
        repo: repoPath,
        init: {
          algorithm: keyTypes[algorithm],
          bits: bits,
          privateKey: privateKey,
          emptyRepo: emptyRepo,
          profiles: profile
        },
        pass: pass,
        start: false,
        config
      })
    } catch (/** @type {any} */ err) {
      if (err.code === 'EACCES') {
        err.message = 'EACCES: permission denied, stat $IPFS_PATH/version'
      }
      throw err
    }
  }
}

export default command
