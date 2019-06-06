'use strict'

const { ipfsPathHelp } = require('../utils')

module.exports = {
  command: 'init [config] [options]',
  describe: 'Initialize a local IPFS node\n\n' +
    'If you are going to run IPFS in a server environment, you may want to ' +
    `initialize it using the 'server' profile.\n\n` +
    'For the list of available profiles run `jsipfs config profile ls`',
  builder (yargs) {
    return yargs
      .epilog(ipfsPathHelp)
      .positional('config', {
        describe: 'Node config, this should be JSON and will be merged with the default config. See https://github.com/ipfs/js-ipfs#optionsconfig',
        type: 'string'
      })
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
      .option('profile', {
        alias: 'p',
        type: 'string',
        describe: `Apply profile settings to config. Multiple profiles can be separated by ','`
      })
  },

  handler (argv) {
    argv.resolve((async () => {
      const path = argv.getRepoPath()

      argv.print(`initializing ipfs node at ${path}`)

      // Required inline to reduce startup time
      const IPFS = require('../../core')
      const Repo = require('ipfs-repo')

      const node = new IPFS({
        repo: new Repo(path),
        init: false,
        start: false,
        config: argv.config || {}
      })

      try {
        await node.init({
          bits: argv.bits,
          privateKey: argv.privateKey,
          emptyRepo: argv.emptyRepo,
          profile: argv.profile,
          pass: argv.pass,
          log: argv.print
        })
      } catch (err) {
        if (err.code === 'EACCES') {
          err.message = `EACCES: permission denied, stat $IPFS_PATH/version`
        }
        throw err
      }
    })())
  }
}
