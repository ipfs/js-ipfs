'use strict'

const parseDuration = require('parse-duration').default

module.exports = {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names.',

  builder: {
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

  async handler ({ ctx: { ipfs, print }, ipfsPath, resolve, lifetime, key, ttl, timeout }) {
    const result = await ipfs.name.publish(ipfsPath, {
      resolve,
      lifetime,
      key,
      ttl,
      timeout
    })
    print(`Published to ${result.name}: ${result.value}`)
  }
}
