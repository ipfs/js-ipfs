import yargs from 'yargs'
import { ipfsPathHelp, disablePrinting } from './utils.js'
import { commandList } from './commands/index.js'

const args = yargs(process.argv.slice(2))
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
  // @ts-ignore types are wrong
  .command(commandList)
  .help()
  .strict()
  .completion()

export default args
