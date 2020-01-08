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

  async handler (argv) {
    const result = await argv.ipfs.api.name.publish(argv.ipfsPath, argv)
    argv.print(`Published to ${result.name}: ${result.value}`)
  }
}
