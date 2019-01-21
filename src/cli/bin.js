#! /usr/bin/env node

'use strict'

const YargsPromise = require('yargs-promise')
const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const utils = require('./utils')
const print = utils.print
const mfs = require('ipfs-mfs/cli')
const debug = require('debug')('ipfs:cli')

const pkg = readPkgUp.sync({ cwd: __dirname }).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const args = process.argv.slice(2)

const cli = yargs
  .option('silent', {
    desc: 'Write no output',
    type: 'boolean',
    default: false,
    coerce: ('silent', silent => {
      if (silent) {
        utils.disablePrinting()
      }
      return silent
    })
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

    if (args.length > 0) {
      print(msg)
    }

    yargs.showHelp()
  })

// Need to skip to avoid locking as these commands
// don't require a daemon
if (args[0] === 'daemon' || args[0] === 'init') {
  cli
    .help()
    .strict()
    .completion()
    .command(require('./commands/daemon'))
    .command(require('./commands/init'))

  new YargsPromise(cli).parse(args)
    .then(({ data }) => {
      if (data) print(data)
    })
} else {
  // here we have to make a separate yargs instance with
  // only the `api` option because we need this before doing
  // the final yargs parse where the command handler is invoked..
  yargs().option('api').parse(process.argv, (err, argv, output) => {
    if (err) {
      throw err
    }

    utils.getIPFS(argv, (err, ipfs, cleanup) => {
      if (err) {
        throw err
      }

      // add MFS (Files API) commands
      mfs(cli)

      cli
        .commandDir('commands')
        .help()
        .strict()
        .completion()

      let exitCode = 0

      const parser = new YargsPromise(cli, { ipfs })
      parser.parse(args)
        .then(({ data, argv }) => {
          if (data) {
            print(data)
          }
        })
        .catch((arg) => {
          debug(arg)

          // the argument can have a different shape depending on where the error came from
          if (arg.message) {
            print(arg.message)
          } else if (arg.error && arg.error.message) {
            print(arg.error.message)
          } else {
            print('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
          }

          exitCode = 1
        })
        .then(() => cleanup())
        .catch(() => {})
        .then(() => {
          if (exitCode !== 0) {
            process.exit(exitCode)
          }
        })
    })
  })
}
