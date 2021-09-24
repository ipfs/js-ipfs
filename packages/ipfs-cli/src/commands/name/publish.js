import parseDuration from 'parse-duration'
import {
  stripControlCharacters
} from '../../utils.js'

export default {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names.',

  builder: {
    ipfsPath: {
      type: 'string'
    },
    resolve: {
      alias: 'r',
      describe: 'Resolve given path before publishing. Default: true.',
      default: true,
      type: 'boolean'
    },
    lifetime: {
      alias: 't',
      describe: 'Time duration that the record will be valid for. Default: 24h.',
      default: '24h',
      type: 'string'
    },
    key: {
      alias: 'k',
      describe: 'Name of the key to be used, as listed by "ipfs key list -l". Default: self.',
      default: 'self',
      type: 'string'
    },
    ttl: {
      describe: 'Time duration this record should be cached for (caution: experimental).',
      default: '',
      type: 'string'
    },
    timeout: {
      type: 'string',
      coerce: parseDuration
    }
  },

  /**
   * @param {object} argv
   * @param {import('../../types').Context} argv.ctx
   * @param {import('multiformats/cid').CID} argv.ipfsPath
   * @param {boolean} argv.resolve
   * @param {string} argv.lifetime
   * @param {string} argv.key
   * @param {string} argv.ttl
   * @param {number} argv.timeout
   */
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
