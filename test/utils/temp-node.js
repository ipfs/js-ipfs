/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

const IPFS = require('../../src/core')
const createTempRepo = require('./temp-repo')

function setAddresses (repo, num, callback) {
  repo.config.get((err, config) => {
    expect(err).to.not.exist
    config.Addresses = {
      Swarm: [
        `/ip4/127.0.0.1/tcp/1000${num}`
      ],
      API: `/ip4/127.0.0.1/tcp/1100${num}`,
      Gateway: `/ip4/127.0.0.1/tcp/1200${num}`
    }

    repo.config.set(config, callback)
  })
}

function createTempNode (num, callback) {
  const repo = createTempRepo()
  const ipfs = new IPFS(repo)
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
