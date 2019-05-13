'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names.',

  builder: {
    resolve: {
      alias: 'r',
      describe: 'Resolve given path before publishing. Default: true.',
      default: true
    },
    lifetime: {
      alias: 't',
      describe: 'Time duration that the record will be valid for. Default: 24h.',
      default: '24h'
    },
    key: {
      alias: 'k',
      describe: 'Name of the key to be used, as listed by "ipfs key list -l". Default: self.',
      default: 'self'
    },
    ttl: {
      describe: 'Time duration this record should be cached for (caution: experimental).',
      default: ''
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      // yargs-promise adds resolve/reject properties to argv
      // resolve should use the alias as resolve will always be overwritten to a function
      let resolve = true

      if (argv.r === false || argv.r === 'false') {
        resolve = false
      }

      const opts = {
        resolve,
        lifetime: argv.lifetime,
        key: argv.key,
        ttl: argv.ttl
      }

      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.publish(argv.ipfsPath, opts)
      print(`Published to ${result.name}: ${result.value}`)
    })())
  }
}
