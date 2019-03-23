'use strict'

const yargs = require('yargs')
const utils = require('./utils')
const print = utils.print

const parser = yargs
  .option('silent', {
    desc: 'Write no output',
    type: 'boolean',
    default: false,
    coerce: silent => {
      if (silent) utils.disablePrinting()
      return silent
    }
  })
  .option('pass', {
    desc: 'Pass phrase for the keys',
    type: 'string',
    default: ''
  })
  .epilog(utils.ipfsPathHelp)
  .demandCommand(1)
  .fail((msg, err, yargs) => {
    if (err) {
      throw err // preserve stack
    }
    print(msg)
    yargs.showHelp()
  })
  .commandDir('commands')
  .middleware(argv => {
    // Function to get hold of a singleton ipfs instance
    argv.getIpfs = utils.singleton(cb => utils.getIPFS(argv, cb))
    return argv
  })
  .help()
  .strict()
  .completion()

module.exports = parser
