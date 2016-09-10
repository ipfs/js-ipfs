'use strict'

const IpfsRepo = require('ipfs-repo')
const Ipfs = require('../../core')
const Store = require('fs-pull-blob-store')
const utils = require('../utils')

module.exports = {
  command: 'init',

  describe: 'Initialize a local IPFS node',

  builder: {
    bits: {
      type: 'number',
      alias: 'b',
      default: '2048',
      describe: 'Number of bits to use in the generated RSA private key (defaults to 2048)'
    },
    force: {
      alias: 'f',
      type: 'boolean',
      describe: 'Overwrite existing config (if it exists)'
    },
    emptyRepo: {
      alias: 'e',
      type: 'boolean',
      describe: "Don't add and pin help files to the local storage"
    }
  },

  handler (argv) {
    const path = utils.getRepoPath()

    const log = utils.createLogger(true)
    log(`initializing ipfs node at ${path}`)

    const repo = new IpfsRepo(path, {
      stores: Store
    })

    const ipfs = new Ipfs(repo)

    ipfs.init({
      bits: argv.bits,
      force: argv.force,
      emptyRepo: argv.emptyRepo,
      log
    }, function (err) {
      if (err) {
        console.error(err.toString())
        process.exit(1)
      }
    })
  }
}
