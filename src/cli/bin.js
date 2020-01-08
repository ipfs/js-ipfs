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

const fs = require('fs')
const updateNotifier = require('update-notifier')
const debug = require('debug')('ipfs:cli')
const { errors: { InvalidRepoVersionError } } = require('ipfs-repo')
const parser = require('./parser')

const commandAlias = require('./command-alias')
const { print, getAPI, getRepoPath } = require('./utils')

// Check if an update is available and notify
const oneWeek = 1000 * 60 * 60 * 24 * 7
updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

// Apply command aliasing (eg `refs local` -> `refs-local`)
const args = commandAlias(process.argv.slice(2))
const repoPath = getRepoPath()

let ipfs = null
parser
  .middleware(async (argv) => {
    // Check for repo in all commands that need it
    if (!['init', 'daemon', 'version'].includes(argv._[0])) {
      if (!fs.existsSync(repoPath)) {
        throw new Error(`no IPFS repo found in ${repoPath}.\nplease run: 'ipfs init'`)
      }
    }

    // Get an API in all commands that need one
    if (!['daemon', 'init'].includes(argv._[0])) {
      ipfs = argv.ipfs = await getAPI(argv)
    }

    // Add repo path and print function to the commands context
    argv.repoPath = repoPath
    argv.print = print
    return argv
  })
  .onFinishCommand(async (data) => {
    // Print to stdout anything returned by the commands
    if (data) {
      console.log(data)
    }

    // Clean the ipfs interface if needed
    if (ipfs) {
      await ipfs.cleanup()
    }
  })
  .fail(async (msg, err, yargs) => {
    // Handle yargs errors
    if (msg) {
      yargs.showHelp()
      console.error('\n')
      console.error('Error:', msg)
    }

    // Handle commands handler errors
    if (err) {
      if (err.code === InvalidRepoVersionError.code) {
        err.message = 'Incompatible repo version. Migration needed. Pass --migrate for automatic migration'
      }
      if (debug.enabled) {
        debug(err)
      } else {
        console.error(err.message)
      }
    }

    // Clean the ipfs interface if needed
    if (ipfs) {
      await ipfs.cleanup()
    }

    process.exit(1)
  })
  .parse(args)
