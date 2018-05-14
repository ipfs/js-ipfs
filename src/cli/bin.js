#! /usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const fs = require('fs')
const path = require('path')
const utils = require('./utils')
const print = utils.print

const pkg = readPkgUp.sync({cwd: __dirname}).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const args = process.argv.slice(2)

// Determine if the first argument is a sub-system command
const commandNames = fs.readdirSync(path.join(__dirname, 'commands'))
const isCommand = commandNames.includes(`${args[0]}.js`)

const cli = yargs
  .option('silent', {
    desc: 'Write no output',
    type: 'boolean',
    default: false,
    coerce: ('silent', silent => silent ? utils.disablePrinting() : silent)
  })
  .option('pass', {
    desc: 'Pass phrase for the keys',
    type: 'string',
    default: ''
  })
  .commandDir('commands', {
    // Only include the commands for the sub-system we're using, or include all
    // if no sub-system command has been passed.
    include (path, filename) {
      if (!isCommand) return true
      return `${args[0]}.js` === filename
    }
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

// If not a sub-system command then load the top level aliases
if (!isCommand) {
  // NOTE: This creates an alias of
  // `jsipfs files {add, get, cat}` to `jsipfs {add, get, cat}`.
  // This will stay until https://github.com/ipfs/specs/issues/98 is resolved.
  const addCmd = require('./commands/files/add')
  const catCmd = require('./commands/files/cat')
  const getCmd = require('./commands/files/get')
  const aliases = [addCmd, catCmd, getCmd]
  aliases.forEach((alias) => {
    cli.command(alias.command, alias.describe, alias.builder, alias.handler)
  })
}

// Need to skip to avoid locking as these commands
// don't require a daemon
if (args[0] === 'daemon' || args[0] === 'init') {
  cli
    .help()
    .strict()
    .completion()
    .parse(args)
} else {
  // here we have to make a separate yargs instance with
  // only the `api` option because we need this before doing
  // the final yargs parse where the command handler is invoked..
  yargs().option('api').parse(process.argv, (err, argv, output) => {
    if (err) {
      throw err
    }
    utils.getIPFS(argv, (err, ipfs, cleanup) => {
      if (err) { throw err }

      cli
        .help()
        .strict()
        .completion()
        .parse(args, { ipfs: ipfs }, (err, argv, output) => {
          if (output) { print(output) }

          cleanup(() => {
            if (err) { throw err }
          })
        })
    })
  })
}
