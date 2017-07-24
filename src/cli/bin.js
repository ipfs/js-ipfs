#! /usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')
const utils = require('./utils')
const print = utils.print

const pkg = readPkgUp.sync({cwd: __dirname}).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const cli = yargs
  .option('q', {
    alias: 'quiet',
    desc: 'suppress output',
    type: 'boolean',
    coerce: (quiet) => { if (quiet) { utils.disablePrinting() } }
  })
  .commandDir('commands')
  .demandCommand(1)
  .fail((msg, err, yargs) => {
    if (err) {
      throw err // preserve stack
    }
    yargs.showHelp()
  })

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

const args = process.argv.slice(2)

// Need to skip to avoid locking as these commands
// don't require a daemon
if (args[0] === 'daemon' || args[0] === 'init') {
  cli
    .help()
    .strict(false)
    .completion()
    .parse(args)
} else {
  utils.getIPFS((err, ipfs, cleanup) => {
    if (err) { throw err }

    cli
      .help()
      .strict(false)
      .completion()
      .parse(args, { ipfs: ipfs }, (err, argv, output) => {
        if (output) { print(output) }

        cleanup(() => {
          if (err) { throw err }
        })
      })
  })
}
