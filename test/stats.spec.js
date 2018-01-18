/* eslint-env mocha */
'use strict'

const FactoryClient = require('./ipfs-factory/client')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

describe('stats', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let fc

  before((done) => {
    fc = new FactoryClient()
    fc.spawnNode((err, node) => {
      expect(err).to.not.exist()
      ipfs = node
      done()
    })
  })

  after((done) => {
    fc.dismantle(done)
  })

  describe('Callback API', () => {
    it('.stats.bitswap', (done) => {
      ipfs.stats.bitswap((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('provideBufLen')
        expect(res).to.have.a.property('wantlist')
        expect(res).to.have.a.property('peers')
        expect(res).to.have.a.property('blocksReceived')
        expect(res).to.have.a.property('dataReceived')
        expect(res).to.have.a.property('blocksSent')
        expect(res).to.have.a.property('dataSent')
        expect(res).to.have.a.property('dupBlksReceived')
        expect(res).to.have.a.property('dupDataReceived')
        done()
      })
    })

    it('.stats.bw', (done) => {
      ipfs.stats.bw((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('totalIn')
        expect(res).to.have.a.property('totalOut')
        expect(res).to.have.a.property('rateIn')
        expect(res).to.have.a.property('rateOut')
        done()
      })
    })

    it('.stats.repo', (done) => {
      ipfs.stats.repo((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('numObjects')
        expect(res).to.have.a.property('repoSize')
        expect(res).to.have.a.property('repoPath')
        expect(res).to.have.a.property('version')
        expect(res).to.have.a.property('storageMax')
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.stats.bw', () => {
      return ipfs.stats.bw()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('totalIn')
          expect(res).to.have.a.property('totalOut')
          expect(res).to.have.a.property('rateIn')
          expect(res).to.have.a.property('rateOut')
        })
    })

    it('.stats.repo', () => {
      return ipfs.stats.repo()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('numObjects')
          expect(res).to.have.a.property('repoSize')
          expect(res).to.have.a.property('repoPath')
          expect(res).to.have.a.property('version')
          expect(res).to.have.a.property('storageMax')
        })
    })

    it('.stats.bitswap', () => {
      return ipfs.stats.bitswap()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('provideBufLen')
          expect(res).to.have.a.property('wantlist')
          expect(res).to.have.a.property('peers')
          expect(res).to.have.a.property('blocksReceived')
          expect(res).to.have.a.property('dataReceived')
          expect(res).to.have.a.property('blocksSent')
          expect(res).to.have.a.property('dataSent')
          expect(res).to.have.a.property('dupBlksReceived')
          expect(res).to.have.a.property('dupDataReceived')
        })
    })
  })
})
