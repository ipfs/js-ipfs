/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const IPFS = require('../../src/core')

// This gets replaced by require('../utils/create-repo-browser.js')
// in the browser
const createTempRepo = require('../utils/create-repo-node.js')

describe.only('create node', () => {
  let ipfs
  let repo

  it('custom repoPath', (done) => {
    const node = new IPFS({
      repo: '/tmp/ipfs-repo-' + Math.random()
    })

    node.on('start', (err) => {
      expect(err).to.not.exist

      node.config.get((err, config) => {
        expect(err).to.not.exist

        expect(config.Identity).to.exist
        node.on('stop', done)
        node.stop()
      })
    })
  })

  it.skip('custom repo', (done) => {
    const node = new IPFS({
      repo: createTempRepo()
    })

    node.on('start', (err) => {
      expect(err).to.not.exist
    })
  })

  it.skip('IPFS.createNode', (done) => {})
  it.skip('init: { bits: 1024 }', (done) => {
    // TODO
    ipfs.init({ bits: 2048 }, (err) => {
      expect(err).to.not.exist

      repo.config.get((err, config) => {
        expect(err).to.not.exist
        expect(config.Identity.PrivKey.length).is.above(256)
        done()
      })
    })
  })
  it.skip('init: false errors (start default: true)', (done) => {})
  it.skip('init: false, start: false', (done) => {})
  it.skip('init: true, start: false', (done) => {})
  it.skip('overload config', (done) => {})
  it.skip('start and stop, start and stop', (done) => {})
})
