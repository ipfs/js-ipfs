import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

/**
 * @typedef {object} Argv
 * @property {import('../../types').Context} Argv.ctx
 * @property {import('multiformats/cid').CID} Argv.ipfsPath
 * @property {boolean} Argv.resolve
 * @property {string} Argv.lifetime
 * @property {string} Argv.key
 * @property {string} Argv.ttl
 * @property {number} Argv.timeout
 */

/** @type {import('yargs').CommandModule<Argv, Argv>} */
const command = {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names',

  builder: {
    ipfsPath: {
      string: true
    },
    resolve: {
      alias: 'r',
      describe: 'Resolve given path before publishing. Default: true',
      default: true,
      boolean: true
    },
    lifetime: {
      alias: 't',
      describe: 'Time duration that the record will be valid for. Default: 24h',
      default: '24h',
      string: true
    },
    key: {
      alias: 'k',
      describe: 'Name of the key to be used, as listed by "ipfs key list -l". Default: self',
      default: 'self',
      string: true
    },
    ttl: {
      describe: 'Time duration this record should be cached for (caution: experimental)',
      default: '',
      string: true
    },
    timeout: {
      string: true,
      coerce: parseDuration
    }
  },

  async handler ({ ctx: { ipfs, print }, ipfsPath, resolve, lifetime, key, ttl, timeout }) {
    const result = await ipfs.name.publish(ipfsPath, {
      resolve,
      lifetime,
      key,
      ttl,
      timeout
    })
    print(`Published to ${stripControlCharacters(result.name)}: ${result.value}`)
  }
}

export default command
