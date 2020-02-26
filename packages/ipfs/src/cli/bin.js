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

const updateNotifier = require('update-notifier')
const debug = require('debug')('ipfs:cli')
const { InvalidRepoVersionError } = require('ipfs-repo/src/errors/index')
const { NotEnabledError } = require('../core/errors')
const parser = require('./parser')

const commandAlias = require('./command-alias')
const { print, getIpfs, getRepoPath } = require('./utils')

// Check if an update is available and notify
const oneWeek = 1000 * 60 * 60 * 24 * 7
updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

// Apply command aliasing (eg `refs local` -> `refs-local`)
const args = commandAlias(process.argv.slice(2))
const repoPath = getRepoPath()

let ctx = {
  print,
  repoPath,
  cleanup: () => {},
  getStdin: () => process.stdin
}
parser
  .middleware(async (argv) => {
    if (!['daemon', 'init'].includes(argv._[0])) {
      const { ipfs, isDaemon, cleanup } = await getIpfs(argv)
      ctx = {
        print,
        repoPath,
        ipfs,
        isDaemon,
        cleanup,
        getStdin: ctx.getStdin
      }
    }

    argv.ctx = ctx
    return argv
  })
  .onFinishCommand(async (data) => {
    if (data) {
      print(data)
    }

    await ctx.cleanup()
  })
  .fail(async (msg, err, yargs) => {
    // Handle yargs errors
    if (msg) {
      yargs.showHelp()
      print.error('\n')
      print.error(`Error: ${msg}`)
    }

    // Handle commands handler errors
    if (err) {
      if (err.code === InvalidRepoVersionError.code) {
        err.message = 'Incompatible repo version. Migration needed. Pass --migrate for automatic migration'
      }

      if (err.code === NotEnabledError.code) {
        err.message = `no IPFS repo found in ${getRepoPath()}.\nplease run: 'ipfs init'`
      }

      if (debug.enabled) {
        debug(err)
      } else {
        print.error(err.message)
      }
    }

    await ctx.cleanup()

    process.exit(1)
  })
  .parse(args)
