#! /usr/bin/env node

'use strict'

const YargsPromise = require('yargs-promise')
const yargs = require('yargs/yargs')
const updateNotifier = require('update-notifier')
const utils = require('./utils')
const print = utils.print
const mfs = require('ipfs-mfs/cli')
const debug = require('debug')('ipfs:cli')
const pkg = require('../../package.json')

async function main (args) {
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

  const cli = yargs(args)
    .option('silent', {
      desc: 'Write no output',
      type: 'boolean',
      default: false,
      coerce: silent => {
        if (silent) utils.disablePrinting()
        return silent
      }
    })
    .option('pass', {
      desc: 'Pass phrase for the keys',
      type: 'string',
      default: ''
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

  // Function to get hold of a singleton ipfs instance
  const getIpfs = utils.singleton(cb => utils.getIPFS(yargs(args).argv, cb))

  // add MFS (Files API) commands
  mfs(cli)

  cli
    .commandDir('commands')
    .help()
    .strict()
    .completion()

  let exitCode = 0

  try {
    const { data } = await new YargsPromise(cli, { getIpfs }).parse(args)
    if (data) print(data)
  } catch (err) {
    debug(err)

    // the argument can have a different shape depending on where the error came from
    if (err.message || (err.error && err.error.message)) {
      print(err.message || err.error.message)
    } else {
      print('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
    }

    exitCode = 1
  } finally {
    // If an IPFS instance was used in the handler then clean it up here
    if (getIpfs.instance) {
      try {
        const cleanup = getIpfs.rest[0]
        await cleanup()
      } catch (err) {
        debug(err)
        exitCode = 1
      }
    }
  }

  if (exitCode) {
    process.exit(exitCode)
  }
}

main(process.argv.slice(2))
