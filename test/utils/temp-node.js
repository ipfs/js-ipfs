/* eslint-env mocha */
'use strict'

const leftPad = require('left-pad')
const series = require('async/series')

const IPFS = require('../../src/core')
const createTempRepo = require('./temp-repo')

function setAddresses (repo, addresses, callback) {
  repo.config.get((err, config) => {
    if (err) {
      return callback(err)
    }

    config.Addresses = addresses

    config.Discovery.MDNS.Enabled = false

    repo.config.set(config, callback)
  })
}

/*
 * options.repo - repo to use
 * options.num - generate addrs based on num for port
 * options.addresses - uses this addrs instead of default
 */
function createTempNode (options, callback) {
  const repo = options.repo ? options.repo : createTempRepo()
  const node = new IPFS(repo)

  let addresses

  if (options.num) {
    const pad = leftPad(options.num, 3, 0)

    addresses = {
      Swarm: [
        `/ip4/127.0.0.1/tcp/10${pad}`,
        `/ip4/127.0.0.1/tcp/20${pad}/ws`
      ],
      API: `/ip4/127.0.0.1/tcp/31${pad}`,
      Gateway: `/ip4/127.0.0.1/tcp/32${pad}`
    }
  } else if (options.addresses) {
    addresses = options.addresses
  }

  series([
    (cb) => node.init({ emptyRepo: true, bits: 1024 }, cb),
    (cb) => setAddresses(repo, addresses, cb),
    (cb) => node.load(cb)
  ], (err) => callback(err, node))
}

module.exports = createTempNode
