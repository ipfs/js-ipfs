'use strict'

const print = require('../../utils').print

module.exports = {
  command: 'publish <ipfsPath>',

  describe: 'Publish IPNS names.',

  builder: {
    resolve: {
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
      describe: 'Name of the key to be used or a valid PeerID, as listed by "ipfs key list -l". Default: self.',
      default: 'self'
    },
    ttl: {
      describe: 'Time duration this record should be cached for (caution: experimental).',
      default: ''
    }
  },

  handler (argv) {
    const opts = {
      resolve: argv.resolve,
      lifetime: argv.lifetime,
      key: argv.key,
      ttl: argv.ttl
    }

    argv.ipfs.name.publish(argv['ipfsPath'], opts, (err, result) => {
      if (err) {
        throw err
      }

      print(`Published to ${result.name}: ${result.value}`)
    })
  }
}
