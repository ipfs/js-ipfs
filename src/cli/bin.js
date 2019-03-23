#! /usr/bin/env node

'use strict'

const YargsPromise = require('yargs-promise')
const updateNotifier = require('update-notifier')
const utils = require('./utils')
const print = utils.print
const mfs = require('ipfs-mfs/cli')
const debug = require('debug')('ipfs:cli')
const pkg = require('../../package.json')
const parser = require('./parser')

async function main (args) {
  const oneWeek = 1000 * 60 * 60 * 24 * 7
  updateNotifier({ pkg, updateCheckInterval: oneWeek }).notify()

  const cli = new YargsPromise(parser)

  // add MFS (Files API) commands
  mfs(cli)

  let getIpfs = null

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
      debug(error)
      // the argument can have a different shape depending on where the error came from
      if (error.message || (error.error && error.error.message)) {
        print(error.message || error.error.message)
      } else {
        print('Unknown error, please re-run the command with DEBUG=ipfs:cli to see debug output')
      }
      process.exit(1)
    })
    .finally(async () => {
      // If an IPFS instance was used in the handler then clean it up here
      if (getIpfs && getIpfs.instance) {
        try {
          const cleanup = getIpfs.rest[0]
          await cleanup()
        } catch (err) {
          debug(err)
          process.exit(1)
        }
      }
    })
}

main(process.argv.slice(2))
