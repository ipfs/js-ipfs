'use strict'

const yargs = require('yargs/yargs')(process.argv.slice(2))
const mfs = require('ipfs-mfs/cli')
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
  .option('migrate', {
    desc: 'Enable/disable automatic repo migrations',
    type: 'boolean',
    default: false
  })
  .epilog(utils.ipfsPathHelp)
  .demandCommand(1)
  .showHelpOnFail(false)
  .commandDir('commands')
  .help()
  .strict()
  .completion()

// add MFS (Files API) commands
mfs(parser)

module.exports = parser
