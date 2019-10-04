#! /usr/bin/env node

/* eslint-disable no-console */
'use strict'

// Handle any uncaught errors
process.once('uncaughtException', (err, origin) => {
  if (!origin || origin === 'uncaughtException') {
    console.error(err)
    process.exit(1)
  }
})
process.once('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

const semver = require('semver')
const pkg = require('../../package.json')
// Check for node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
  console.error(`Please update your Node.js version to ${pkg.engines.node}`)
  process.exit(1)
}

const YargsPromise = require('yargs-promise')
const updateNotifier = require('update-notifier')
const debug = require('debug')('ipfs:cli')
const parser = require('./parser')
const commandAlias = require('./command-alias')
const { print } = require('./utils')

// Check if an update is available and notify
const oneWeek = 1000 * 60 * 60 * 24 * 7
updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

const cli = new YargsPromise(parser)

let getIpfs = null

// Apply command aliasing (eg `refs local` -> `refs-local`)
const args = commandAlias(process.argv.slice(2))
cli
  .parse(args)
  .then(({ data, argv }) => {
    getIpfs = argv.getIpfs
    if (data) {
      print(data)
    }
  })
  .catch(({ error, argv }) => {
    getIpfs = argv && argv.getIpfs
    if (error.message) {
      print(error.message)
      debug(error)
    } else {
      print('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
      debug(error)
    }
    process.exit(1)
  })
  .finally(() => {
    if (getIpfs && getIpfs.instance) {
      const cleanup = getIpfs.rest[0]
      return cleanup()
    }
  })
