#! /usr/bin/env node

'use strict'

const expect = require('chai').expect

const IPFS = require('../../src/core')
const createTempRepo = require('./temp-repo')

function setAddresses (repo, callback) {
  repo.config.get((err, config) => {
    expect(err).to.not.exist
    config.Addresses = {
      Swarm: [
        '/ip4/127.0.0.1/tcp/0'
      ],
      API: '',
      Gateway: ''
    }

    repo.config.set(config, callback)
  })
}

function createTempNode (callback) {
  const repo = createTempRepo()
  const ipfs = new IPFS(repo)

  ipfs.init({ emptyRepo: true }, (err) => {
    expect(err).to.not.exist
    setAddresses(repo, (err) => {
      expect(err).to.not.exist

      ipfs.load((err) => {
        expect(err).to.not.exist
        callback(null, ipfs)
      })
    })
  })
}

createTempNode((err, ipfs) => {
  expect(err).to.not.exist
  ipfs.goOnline(() => {
    ipfs.id((err, id) => {
      expect(err).to.not.exist

      ipfs._libp2pNode.handle('/echo/1.0.0', (conn) => {
        conn.pipe(conn)
      })

      console.log(JSON.stringify(id))
    })
  })
})
