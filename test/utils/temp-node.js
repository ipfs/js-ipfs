/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const leftPad = require('left-pad')
const series = require('run-series')

const IPFS = require('../../src/core')
const createTempRepo = require('./temp-repo')

function setAddresses (repo, num, callback) {
  repo.config.get((err, config) => {
    expect(err).to.not.exist
    config.Addresses = {
      Swarm: [
        `/ip4/127.0.0.1/tcp/10${num}`,
        `/ip4/127.0.0.1/tcp/20${num}/ws`
      ],
      API: `/ip4/127.0.0.1/tcp/31${num}`,
      Gateway: `/ip4/127.0.0.1/tcp/32${num}`
    }

    repo.config.set(config, callback)
  })
}

function createTempNode (num, callback) {
  const repo = createTempRepo()
  const ipfs = new IPFS(repo)

  num = leftPad(num, 3, 0)

  series([
    (cb) => ipfs.init({ emptyRepo: true }, cb),
    (cb) => setAddresses(repo, num, cb),
    (cb) => ipfs.load(cb)
  ], (err) => {
    if (err) return callback(err)
    callback(null, ipfs)
  })
}

module.exports = createTempNode
