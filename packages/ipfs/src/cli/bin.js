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
const updateNotifier = require('update-notifier')
const { InvalidRepoVersionError } = require('ipfs-repo/src/errors/index')
const { NotEnabledError } = require('../core/errors')
const { print, getIpfs, getRepoPath } = require('./utils')
const debug = require('debug')('ipfs:cli')
const pkg = require('../../package.json')
const cli = require('./')

// Check for node version
if (!semver.satisfies(process.versions.node, pkg.engines.node)) {
  console.error(`Please update your Node.js version to ${pkg.engines.node}`)
  process.exit(1)
}

// Check if an update is available and notify
const oneWeek = 1000 * 60 * 60 * 24 * 7
updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

async function main () {
  let exitCode = 0
  let ctx = {
    print,
    getStdin: () => process.stdin,
    repoPath: getRepoPath(),
    cleanup: () => {}
  }

  const command = process.argv.slice(2)

  try {
    const data = await cli(command, async (argv) => {
      if (!['daemon', 'init'].includes(command[0])) {
        const { ipfs, isDaemon, cleanup } = await getIpfs(argv)

        ctx = {
          ...ctx,
          ipfs,
          isDaemon,
          cleanup
        }
      }

      argv.ctx = ctx

      return argv
    })

    if (data) {
      print(data)
    }
  } catch (err) {
    if (err.code === InvalidRepoVersionError.code) {
      err.message = 'Incompatible repo version. Migration needed. Pass --migrate for automatic migration'
    }

    if (err.code === NotEnabledError.code) {
      err.message = `no IPFS repo found in ${ctx.repoPath}.\nplease run: 'ipfs init'`
    }

    // Handle yargs errors
    if (err.code === 'ERR_YARGS') {
      err.yargs.showHelp()
      ctx.print.error('\n')
      ctx.print.error(`Error: ${err.message}`)
    } else if (debug.enabled) {
      // Handle commands handler errors
      debug(err)
    } else {
      ctx.print.error(err.message)
    }

    exitCode = 1
  } finally {
    await ctx.cleanup()
  }

  if (command[0] === 'daemon' && exitCode === 0) {
    // don't shut down the daemon process
    return
  }

  process.exit(exitCode)
}

main()
