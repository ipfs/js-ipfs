/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const f = require('./utils/factory')

describe('.bitswap', function () {
  this.timeout(20 * 1000) // slow CI

  let ipfs
  let ipfsd = null

  before(function (done) {
    this.timeout(20 * 1000) // slow CI

    f.spawn({ initOptions: { bits: 1024 } }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = IPFSApi(_ipfsd.apiAddr)
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  it('.wantlist', (done) => {
    ipfs.bitswap.wantlist((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.have.to.eql({
        Keys: []
      })
      done()
    })
  })

  it('.stat', (done) => {
    ipfs.bitswap.stat((err, res) => {
      expect(err).to.not.exist()
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

  it('.unwant', (done) => {
    const key = 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
    ipfs.bitswap.unwant(key, (err) => {
      expect(err).to.not.exist()
      done()
    })
  })
})
