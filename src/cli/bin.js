#! /usr/bin/env node

/* eslint-disable no-console */
'use strict'

process.on('uncaughtException', (err) => {
  console.info(err)

  throw err
})

process.on('unhandledRejection', (err) => {
  console.info(err)

  throw err
})

const semver = require('semver')
const pkg = require('../../package.json')

if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
  console.error(`Please update your Node.js version to ${pkg.engines.node}`)
  process.exit(1)
}

const YargsPromise = require('yargs-promise')
const updateNotifier = require('update-notifier')
const onExit = require('async-exit-hook')
const utils = require('./utils')
const print = utils.print
const debug = require('debug')('ipfs:cli')
const parser = require('./parser')
const commandAlias = require('./command-alias')

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
    getIpfs = argv.getIpfs
    if (error) {
      throw error
    }
    throw new Error('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
  })

onExit(cb => {
  // If an IPFS instance was used in the handler then clean it up here
  if (getIpfs && getIpfs.instance) {
    const cleanup = getIpfs.rest[0]

    return cleanup()
      .then(() => cb())
      .catch(err => {
        print(err.message)
        debug(err)
        cb()
      })
  }
  cb()
})

onExit.unhandledRejectionHandler(err => {
  print(err.message)
  debug(err)
})
