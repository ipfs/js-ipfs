'use strict'

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
    }
  },

  handler (argv) {
    argv.resolve((async () => {
      // yargs-promise adds resolve/reject properties to argv
      // resolve should use the alias as resolve will always be overwritten to a function
      const opts = {
        resolve: argv.r,
        lifetime: argv.lifetime,
        key: argv.key,
        ttl: argv.ttl
      }

      const ipfs = await argv.getIpfs()
      const result = await ipfs.name.publish(argv.ipfsPath, opts)
      argv.print(`Published to ${result.name}: ${result.value}`)
    })())
  }
}
