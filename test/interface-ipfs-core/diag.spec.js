/* eslint-env mocha */
'use strict'

const FactoryClient = require('../factory/factory-client')
const expect = require('chai').expect

describe('.diag', () => {
  let ipfs
  let fc

  before(function (done) {
    this.timeout(20 * 1000) // slow CI
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  it('.diag.net', (done) => {
    ipfs.diag.net((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  it('.diag.sys', (done) => {
    ipfs.diag.sys((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      expect(res).to.have.a.property('memory')
      expect(res).to.have.a.property('diskinfo')
      done()
    })
  })

  it('.diag.cmds', (done) => {
    ipfs.diag.cmds((err, res) => {
      expect(err).to.not.exist
      expect(res).to.exist
      done()
    })
  })

  describe('promise', () => {
    it('.diag.net', () => {
      return ipfs.diag.net()
        .then((res) => {
          expect(res).to.exist
        })
    })

    it('.diag.sys', () => {
      return ipfs.diag.sys()
        .then((res) => {
          expect(res).to.exist
          expect(res).to.have.a.property('memory')
          expect(res).to.have.a.property('diskinfo')
        })
    })

    it('.diag.cmds', () => {
      return ipfs.diag.cmds()
        .then((res) => {
          expect(res).to.exist
        })
    })
  })
})
