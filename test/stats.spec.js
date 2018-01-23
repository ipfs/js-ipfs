/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('stats', function () {
  this.timeout(50 * 1000) // slow CI

  let ipfs
  let ipfsd

  before((done) => {
    df.spawn((err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

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
