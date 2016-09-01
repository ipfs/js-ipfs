#! /usr/bin/env node

'use strict'

const yargs = require('yargs')
const updateNotifier = require('update-notifier')
const readPkgUp = require('read-pkg-up')

const pkg = readPkgUp.sync().pkg
updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 24 * 7 // 1 week
}).notify()

yargs
  .commandDir('commands')
  .demand(1)
  .help()
  .strict()
  .completion()
  .argv
