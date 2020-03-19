'use strict'

const yargs = require('yargs/yargs')(process.argv.slice(2))
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

module.exports = parser
