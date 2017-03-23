'use strict'

const Repo = require('ipfs-repo')
const IPFS = require('../../core')
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

    const node = new IPFS({
      repo: new Repo(path),
      init: false,
      start: false
    })

    node.init({
      bits: argv.bits,
      emptyRepo: argv.emptyRepo,
      log: log
    }, (err) => {
      if (err) {
        if (err.code === 'EACCES') {
          err.message = `EACCES: permission denied, stat $IPFS_PATH/version`
        }
        console.error(err.toString())
        process.exit(1)
      }
    })
  }
}
