#! /usr/bin/env node

/* eslint-disable no-console */

/**
 * Handle any uncaught errors
 *
 * @param {any} err
 * @param {string} [origin]
 */
import semver from 'semver'
import * as pkg from './package.js'
import debug from 'debug'

import { print, getIpfs, getRepoPath } from 'ipfs-cli/utils'
import { cli } from 'ipfs-cli'

import updateNotifier from 'update-notifier'

/**
 * @param {any} err
 * @param {string} origin
 */
const onUncaughtException = (err, origin) => {
  if (!origin || origin === 'uncaughtException') {
    console.error(err)
    process.exit(1)
  }
}

/**
 * Handle any uncaught errors
 *
 * @param {any} err
 */
const onUnhandledRejection = (err) => {
  console.error(err)
  process.exit(1)
}

process.once('uncaughtException', onUncaughtException)
process.once('unhandledRejection', onUnhandledRejection)

const log = debug('ipfs:cli')

process.title = pkg.name

// Check for node version
if (!semver.satisfies(process.versions.node, pkg.node)) {
  console.error(`Please update your Node.js version to ${pkg.node}`)
  process.exit(1)
}

// If we're not running an rc, check if an update is available and notify
if (!pkg.version.includes('-rc')) {
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()
}

/**
 * @param {string[]} argv
 */
async function main (argv) {
  let exitCode = 0
  let ctx = {
    print,
    getStdin: () => process.stdin,
    repoPath: getRepoPath(),
    cleanup: () => {},
    isDaemon: false,
    /** @type {import('ipfs-core-types').IPFS | undefined} */
    ipfs: undefined
  }

  const command = argv.slice(2)

  try {
    const data = await cli(command, async (argv) => {
      if (!['daemon', 'init'].includes(command[0])) {
        // @ts-ignore argv as no properties in common
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
  } catch (/** @type {any} */ err) {
    // TODO: export errors from ipfs-repo to use .code constants
    if (err.code === 'ERR_INVALID_REPO_VERSION') {
      err.message = 'Incompatible repo version. Migration needed. Pass --migrate for automatic migration'
    }

    if (err.code === 'ERR_NOT_ENABLED') {
      err.message = `no IPFS repo found in ${ctx.repoPath}.\nplease run: 'ipfs init'`
    }

    // Handle yargs errors
    if (err.code === 'ERR_YARGS') {
      err.yargs.showHelp()
      ctx.print.error('\n')
      ctx.print.error(`Error: ${err.message}`)
    } else if (log.enabled) {
      // Handle commands handler errors
      log(err)
    } else {
      ctx.print.error(err.message)
    }

    exitCode = 1
  } finally {
    await ctx.cleanup()
  }

  if (command[0] === 'daemon') {
    // don't shut down the daemon process
    return
  }

  process.exit(exitCode)
}

main(process.argv)
