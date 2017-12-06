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
        expect(res).to.have.a.property('ProvideBufLen')
        expect(res).to.have.a.property('Wantlist')
        expect(res).to.have.a.property('Peers')
        expect(res).to.have.a.property('BlocksReceived')
        expect(res).to.have.a.property('DataReceived')
        expect(res).to.have.a.property('BlocksSent')
        expect(res).to.have.a.property('DataSent')
        expect(res).to.have.a.property('DupBlksReceived')
        expect(res).to.have.a.property('DupDataReceived')
        done()
      })
    })

    it('.stats.bw', (done) => {
      ipfs.stats.bw((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('TotalIn')
        expect(res).to.have.a.property('TotalOut')
        expect(res).to.have.a.property('RateIn')
        expect(res).to.have.a.property('RateOut')
        done()
      })
    })

    it('.stats.repo', (done) => {
      ipfs.stats.repo((err, res) => {
        expect(err).to.not.exist()
        expect(res).to.exist()
        expect(res).to.have.a.property('NumObjects')
        expect(res).to.have.a.property('RepoSize')
        expect(res).to.have.a.property('RepoPath')
        expect(res).to.have.a.property('Version')
        expect(res).to.have.a.property('StorageMax')
        done()
      })
    })
  })

  describe('Promise API', () => {
    it('.stats.bw', () => {
      return ipfs.stats.bw()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('TotalIn')
          expect(res).to.have.a.property('TotalOut')
          expect(res).to.have.a.property('RateIn')
          expect(res).to.have.a.property('RateOut')
        })
    })

    it('.stats.repo', () => {
      return ipfs.stats.repo()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('NumObjects')
          expect(res).to.have.a.property('RepoSize')
          expect(res).to.have.a.property('RepoPath')
          expect(res).to.have.a.property('Version')
          expect(res).to.have.a.property('StorageMax')
        })
    })

    it('.stats.bitswap', () => {
      return ipfs.stats.bitswap()
        .then((res) => {
          expect(res).to.exist()
          expect(res).to.have.a.property('ProvideBufLen')
          expect(res).to.have.a.property('Wantlist')
          expect(res).to.have.a.property('Peers')
          expect(res).to.have.a.property('BlocksReceived')
          expect(res).to.have.a.property('DataReceived')
          expect(res).to.have.a.property('BlocksSent')
          expect(res).to.have.a.property('DataSent')
          expect(res).to.have.a.property('DupBlksReceived')
          expect(res).to.have.a.property('DupDataReceived')
        })
    })
  })
})
