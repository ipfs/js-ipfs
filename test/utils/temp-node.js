/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const leftPad = require('left-pad')

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

  ipfs.init({ emptyRepo: true }, (err) => {
    expect(err).to.not.exist
    setAddresses(repo, num, (err) => {
      expect(err).to.not.exist

      ipfs.load((err) => {
        expect(err).to.not.exist
        callback(null, ipfs)
      })
    })
  })
}
module.exports = createTempNode
