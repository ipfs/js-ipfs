/* eslint-env mocha */
'use strict'

const expect = require('chai').expect

module.exports = (ctl) => {
  describe('.bootstrap', () => {
    const invalidArg = 'this/Is/So/Invalid/'
    const validIp4 = '/ip4/101.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'
    let peers

    describe('.add', () => {
      it('returns an error when called with an invalid arg', (done) => {
        ctl.bootstrap.add(invalidArg, (err) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })

      it('returns a list of containing the bootstrap peer when called with a valid arg (ip4)', (done) => {
        ctl.bootstrap.add(validIp4, (err, res) => {
          expect(err).to.not.exist
          expect(res).to.be.eql({ Peers: [validIp4] })
          done()
        })
      })

      it('returns a list of bootstrap peers when called with the default option', (done) => {
        ctl.bootstrap.add({ default: true }, (err, res) => {
          expect(err).to.not.exist
          peers = res.Peers
          expect(peers).to.exist
          expect(peers.length).to.be.above(1)
          done()
        })
      })
    })

    describe('.list', () => {
      it('returns a list of peers', (done) => {
        ctl.bootstrap.list((err, res) => {
          expect(err).to.not.exist
          peers = res.Peers
          expect(peers).to.exist
          done()
        })
      })
    })

    describe('.rm', () => {
      it('returns an error when called with an invalid arg', (done) => {
        ctl.bootstrap.rm(invalidArg, (err) => {
          expect(err).to.be.an.instanceof(Error)
          done()
        })
      })

      it('returns empty list because no peers removed when called without an arg or options', (done) => {
        ctl.bootstrap.rm(null, (err, res) => {
          expect(err).to.not.exist
          peers = res.Peers
          expect(peers).to.exist
          expect(peers.length).to.eql(0)
          done()
        })
      })

      it('returns list containing the peer removed when called with a valid arg (ip4)', (done) => {
        ctl.bootstrap.rm(validIp4, (err, res) => {
          expect(err).to.not.exist

          peers = res.Peers
          expect(peers).to.exist
          expect(peers.length).to.eql(1)
          done()
        })
      })

      it('returns list of all peers removed when all option is passed', (done) => {
        ctl.bootstrap.rm(null, { all: true }, (err, res) => {
          expect(err).to.not.exist
          peers = res.Peers
          expect(peers).to.exist
          done()
        })
      })
    })
  })
}
