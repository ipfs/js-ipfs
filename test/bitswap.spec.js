/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSApi = require('../src')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create()

describe('.bitswap', function () {
  this.timeout(20 * 1000) // slow CI
  let ipfs
  let ipfsd = null

  before((done) => {
    this.timeout(20 * 1000) // slow CI
    df.spawn((err, _ipfsd) => {
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
        Keys: null
      })
      done()
    })
  })

  it('.stat', (done) => {
    ipfs.bitswap.stat((err, res) => {
      expect(err).to.not.exist()
      expect(res).to.have.property('BlocksReceived')
      expect(res).to.have.property('DupBlksReceived')
      expect(res).to.have.property('DupDataReceived')
      expect(res).to.have.property('Peers')
      expect(res).to.have.property('ProvideBufLen')
      expect(res).to.have.property('Wantlist')

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
