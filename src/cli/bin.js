#! /usr/bin/env node

'use strict'

const yargs = require('yargs/yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const { disablePrinting, print, getNodeOrAPI } = require('./utils')
const addCmd = require('./commands/files/add')
const catCmd = require('./commands/files/cat')
const getCmd = require('./commands/files/get')

const pkg = readPkgUp.sync({cwd: __dirname}).pkg

updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const MSG_USAGE = `Usage:
  ipfs - Global p2p merkle-dag filesystem.

  ipfs [options] <command> ...`
const MSG_EPILOGUE = `Use 'ipfs <command> --help' to learn more about each command.

ipfs uses a repository in the local file system. By default, the repo is
located at ~/.ipfs. To change the repo location, set the $IPFS_PATH
environment variable:

  export IPFS_PATH=/path/to/ipfsrepo

EXIT STATUS

The CLI will exit with one of the following values:

0     Successful execution.
1     Failed executions.
`
const MSG_NO_CMD = 'You need at least one command before moving on'

const argv = process.argv.slice(2)
let args = {}
let cli = yargs(argv)
  .usage(MSG_USAGE)
  .option('silent', {
    desc: 'Write no output',
    type: 'boolean',
    default: false,
    coerce: disablePrinting
  })
  .option('debug', {
    desc: 'Show debug output',
    type: 'boolean',
    default: false,
    alias: 'D'
  })
  .option('pass', {
    desc: 'Pass phrase for the keys',
    type: 'string',
    default: ''
  })
  .option('api', {
    desc: 'Use a specific API instance.',
    type: 'string'
  })
  .commandDir('commands')
  // NOTE: This creates an alias of
  // `jsipfs files {add, get, cat}` to `jsipfs {add, get, cat}`.
  // This will stay until https://github.com/ipfs/specs/issues/98 is resolved.
  .command(addCmd)
  .command(catCmd)
  .command(getCmd)
  .demandCommand(1, MSG_NO_CMD)
  .alias('help', 'h')
  .epilogue(MSG_EPILOGUE)
  .strict()
  // .recommendCommands()
  .completion()

if (['daemon', 'init', 'id', 'version'].includes(argv[0])) {
  args = cli.fail((msg, err, yargs) => {
    if (err instanceof Error && err.message && !msg) {
      msg = err.message
    }

    // Cli specific error messages
    if (err && err.code === 'ERR_REPO_NOT_INITIALIZED') {
      msg = `No IPFS repo found in ${err.path}.
please run: 'ipfs init'`
    }

    // Show help and error message
    if (!args.silent) {
      yargs.showHelp()
      console.error('Error: ' + msg)
    }

    // Write to stderr when debug is on
    if (err && args.debug) {
      console.error(err)
    }

    process.exit(1)
  }).argv
} else {
  yargs()
    .option('pass', {
      desc: 'Pass phrase for the keys',
      type: 'string',
      default: ''
    })
    .option('api', {
      desc: 'Use a specific API instance.',
      type: 'string'
    })
    .parse(argv, (err, parsedArgv, output) => {
      if (err) {
        console.error(err)
      } else {
        getNodeOrAPI(parsedArgv)
          .then(node => {
            args = cli
              .parse(argv, { ipfs: node }, (err, parsedArgv, output) => {
                if (output) {
                  print(output)
                }
                if (node && node._repo && !node._repo.closed) {
                  node._repo.close(err => {
                    if (err) {
                      console.error(err)
                    }
                  })
                }
                if (err && parsedArgv.debug) {
                  console.error(err)
                }
              })
          })
          .catch(err => {
            console.error(err)
            process.exit(1)
          })
      }
    })
}
