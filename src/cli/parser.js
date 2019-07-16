'use strict'

const yargs = require('yargs')
const utils = require('./utils')

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
    utils.print(msg)
    yargs.showHelp()
  })
  .commandDir('commands')
  .middleware(argv => Object.assign(argv, {
    getIpfs: utils.singleton(cb => utils.getIPFS(argv, cb)),
    print: utils.print,
    isDaemonOn: utils.isDaemonOn,
    getRepoPath: utils.getRepoPath
  }))
  .help()
  .strict()
  .completion()

module.exports = parser
