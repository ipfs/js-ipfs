import yargs from 'yargs'
import { ipfsPathHelp, disablePrinting } from './utils.js'
import { commandList } from './commands/index.js'

export default () => {
  const args = yargs(process.argv.slice(2))
    .option('silent', {
      desc: 'Write no output',
      boolean: true,
      default: false,
      coerce: silent => {
        if (silent) disablePrinting()
        return silent
      }
    })
    .option('pass', {
      desc: 'Pass phrase for the keys',
      string: true
    })
    .option('migrate', {
      desc: 'Enable/disable automatic repo migrations',
      boolean: true,
      default: false
    })
    .options('api', {
      desc: 'Remote API multiaddr to use',
      string: true
    })
    .epilog(ipfsPathHelp)
    .demandCommand(1, 'Please specify a command')
    .showHelpOnFail(false)
    .help()
    .strict()
    .completion()
    .fail(false)

  commandList.forEach(command => {
    args.command(command)
  })

  return args
}
