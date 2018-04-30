'use strict'

const Repo = require('ipfs-repo')
const IPFS = require('../../core')
const { ipfsPathHelp, getRepoPath, print } = require('../utils')

module.exports = {
  command: 'init',

  describe: 'Initialize a local IPFS node',

  builder (yargs) {
    return yargs
      .epilog(ipfsPathHelp)
      .option('bits', {
        type: 'number',
        alias: 'b',
        default: '2048',
        describe: 'Number of bits to use in the generated RSA private key (defaults to 2048)'
      })
      .option('emptyRepo', {
        alias: 'e',
        type: 'boolean',
        describe: 'Don\'t add and pin help files to the local storage'
      })
  },

  handler (argv) {
    const path = getRepoPath()

    print(`initializing ipfs node at ${path}`)

    return IPFS.createNodePromise({
      repo: new Repo(path),
      init: false,
      start: false
    }).then(node => {
      return node.init({
        bits: argv.bits,
        emptyRepo: argv.emptyRepo,
        pass: argv.pass,
        log: print
      })
    })
  }
}
