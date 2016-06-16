/* eslint-env mocha */
/* globals apiClients */
'use strict'

const expect = require('chai').expect

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'

describe('.bootstrap', () => {
  let peers

  describe('.add', () => {
    it('returns an error when called without args or options', (done) => {
      return apiClients.a.bootstrap.add(null, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('returns an error when called with an invalid arg', (done) => {
      return apiClients.a.bootstrap.add(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('returns a list of containing the bootstrap peer when called with a valid arg (ip4)', (done) => {
      return apiClients.a.bootstrap.add(validIp4, (err, res) => {
        expect(err).to.not.exist
        expect(res).to.be.eql({ Peers: [validIp4] })
        peers = res.Peers
        expect(peers).to.exist
        expect(peers.length).to.eql(1)
        done()
      })
    })

    it('returns a list of bootstrap peers when called with the default option', (done) => {
      return apiClients.a.bootstrap.add(null, { default: true }, (err, res) => {
        expect(err).to.not.exist
        peers = res.Peers
        expect(peers).to.exist
        expect(peers.length).to.above(1)
        done()
      })
    })
  })

  describe('.list', () => {
    it('returns a list of peers', (done) => {
      return apiClients.a.bootstrap.list((err, res) => {
        expect(err).to.not.exist
        peers = res.Peers
        expect(peers).to.exist
        done()
      })
    })
  })

  describe('.rm', () => {
    it('returns an error when called with an invalid arg', (done) => {
      return apiClients.a.bootstrap.rm(invalidArg, (err) => {
        expect(err).to.be.an.instanceof(Error)
        done()
      })
    })

    it('returns empty list because no peers removed when called without an arg or options', (done) => {
      return apiClients.a.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist
        peers = res.Peers
        expect(peers).to.exist
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('returns list containing the peer removed when called with a valid arg (ip4)', (done) => {
      return apiClients.a.bootstrap.rm(null, (err, res) => {
        expect(err).to.not.exist
        peers = res.Peers
        expect(peers).to.exist
        expect(peers.length).to.eql(0)
        done()
      })
    })

    it('returns list of all peers removed when all option is passed', (done) => {
      return apiClients.a.bootstrap.rm(null, { all: true }, (err, res) => {
        expect(err).to.not.exist
        peers = res.Peers
        expect(peers).to.exist
        done()
      })
    })
  })

  describe('.promise', () => {
    describe('.add', () => {
      it('returns an error when called without args or options', () => {
        return apiClients.a.bootstrap.add(null)
          .catch((err) => {
            expect(err).to.be.an.instanceof(Error)
          })
      })

      it('returns an error when called with an invalid arg', () => {
        return apiClients.a.bootstrap.add(invalidArg)
          .catch((err) => {
            expect(err).to.be.an.instanceof(Error)
          })
      })

      it('returns a list of peers when called with a valid arg (ip4)', () => {
        return apiClients.a.bootstrap.add(validIp4)
          .then((res) => {
            expect(res).to.be.eql({ Peers: [validIp4] })
            peers = res.Peers
            expect(peers).to.exist
            expect(peers.length).to.eql(1)
          })
      })

      it('returns a list of default peers when called with the default option', () => {
        return apiClients.a.bootstrap.add(null, { default: true })
          .then((res) => {
            peers = res.Peers
            expect(peers).to.exist
            expect(peers.length).to.above(1)
          })
      })
    })

    describe('.list', () => {
      it('returns a list of peers', () => {
        return apiClients.a.bootstrap.list()
          .then((res) => {
            peers = res.Peers
            expect(peers).to.exist
          })
      })
    })

    describe('.rm', () => {
      it('returns an error when called with an invalid arg', () => {
        return apiClients.a.bootstrap.rm(invalidArg)
          .catch((err) => {
            expect(err).to.be.an.instanceof(Error)
          })
      })

      it('returns empty list when called without an arg or options', () => {
        return apiClients.a.bootstrap.rm(null)
          .then((res) => {
            peers = res.Peers
            expect(peers).to.exist
            expect(peers.length).to.eql(0)
          })
      })

      it('returns list containing the peer removed when called with a valid arg (ip4)', () => {
        return apiClients.a.bootstrap.rm(null)
          .then((res) => {
            peers = res.Peers
            expect(peers).to.exist
            expect(peers.length).to.eql(0)
          })
      })

      it('returns list of all peers removed when all option is passed', () => {
        return apiClients.a.bootstrap.rm(null, { all: true })
          .then((res) => {
            peers = res.Peers
            expect(peers).to.exist
          })
      })
    })
  })
})
