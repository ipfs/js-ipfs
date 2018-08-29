'use strict'

const utils = require('../utils')
const print = utils.print

module.exports = {
  command: 'init',

  describe: 'Initialize a local IPFS node',

  builder (yargs) {
    return yargs
      .epilog(utils.ipfsPathHelp)
      .option('bits', {
        type: 'number',
        alias: 'b',
        default: '2048',
        describe: 'Number of bits to use in the generated RSA private key (defaults to 2048)'
      })
      .option('emptyRepo', {
        alias: 'e',
        type: 'boolean',
        describe: "Don't add and pin help files to the local storage"
      })
      .option('privateKey', {
        alias: 'k',
        type: 'string',
        describe: 'Pre-generated private key to use for the repo'
      })
  },

  handler (argv) {
    const path = utils.getRepoPath()

    print(`initializing ipfs node at ${path}`)

    // Required inline to reduce startup time
    const IPFS = require('../../core')
    const Repo = require('ipfs-repo')

    const node = new IPFS({
      repo: new Repo(path),
      init: false,
      start: false
    })

    node.init({
      bits: argv.bits,
      privateKey: argv.privateKey,
      emptyRepo: argv.emptyRepo,
      pass: argv.pass,
      log: print
    }, (err) => {
      if (err) {
        if (err.code === 'EACCES') {
          err.message = `EACCES: permission denied, stat $IPFS_PATH/version`
        }
        throw err
      }
    })
  }
}
