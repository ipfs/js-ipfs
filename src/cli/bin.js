#! /usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')

const pkg = readPkgUp.sync({cwd: __dirname}).pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

const cli = yargs
  .commandDir('commands')
  .demand(1)

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

// finalize cli setup
cli.help()
  .strict()
  .completion()
.argv
