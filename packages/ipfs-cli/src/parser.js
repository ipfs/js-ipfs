
import yargs from 'yargs/yargs'
import { ipfsPathHelp, disablePrinting } from './utils.js'

const args = yargs(process.argv.slice(2))

export default args
  .option('silent', {
    desc: 'Write no output',
    type: 'boolean',
    default: false,
    coerce: silent => {
      if (silent) disablePrinting()
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
  .options('api', {
    desc: 'Remote API multiaddr to use',
    type: 'string'
  })
  .epilog(ipfsPathHelp)
  .demandCommand(1, 'Please specify a command')
  .showHelpOnFail(false)
  .commandDir('commands')
  .help()
  .strict()
  .completion()
