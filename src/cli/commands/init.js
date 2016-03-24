const Command = require('ronin').Command
const IpfsRepo = require('ipfs-repo')
const Ipfs = require('../../core')

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
    // TODO: what blob store do I use for browser? indexdb, right?
    // well, this IS cli, and there's no browser cli :P
    var someBlobStore = require('fs-blob-store')

    // TODO: --force + --empty-repo will keep your default assets, right?
    // TODO: where to init at? $IPFS_PATH var? homedir/.ipfs otherwise? sounds like a helper method job
    const repo = new IpfsRepo('/tmp/my-little-repo', {
      stores: {
        keys: someBlobStore,
        config: someBlobStore,
        datastore: someBlobStore,
        logs: someBlobStore,
        locks: someBlobStore,
        version: someBlobStore
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

      // TODO: what console output is desirable? any? mimick go-ipfs?
      console.log('res', res)
    })
  }
})
