const Command = require('ronin').Command
const IpfsRepo = require('ipfs-repo')
const Ipfs = require('../../core')
const fsBlobStore = require('fs-blob-store')

module.exports = Command.extend({
  desc: 'Initialize a local IPFS local node',

  options: {
    bits: {
      type: 'number',
      alias: 'b',
      default: '2048',
      desc: 'Number of bits to use in the generated RSA private key (defaults to 2048)'
    },
    force: {
      alias: 'f',
      type: 'boolean',
      desc: 'Overwrite existing config (if it exists)'
    },
    'empty-repo': {
      alias: 'e',
      type: 'boolean',
      desc: "Don't add and pin help files to the local storage"
    }
  },

  run: (bits, force, empty) => {
    const repo = new IpfsRepo('/tmp/my-little-repo', {
      stores: {
        keys: fsBlobStore,
        config: fsBlobStore,
        datastore: fsBlobStore,
        logs: fsBlobStore,
        locks: fsBlobStore,
        version: fsBlobStore
      }
    })

    var ipfs = new Ipfs(repo)
    ipfs.init({
      bits: bits,
      force: force,
      emptyRepo: empty
    }, function (err, res) {
      if (err) {
        console.error(err.toString())
        process.exit(1)
      }
    })
  }
})
