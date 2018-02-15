/* eslint-env mocha */
/* eslint max-nested-callbacks: ["error", 8] */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const invalidArg = 'this/Is/So/Invalid/'
const validIp4 = '/ip4/104.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'

module.exports = (common) => {
  describe('.bootstrap', function () {

    let ipfs
    let peers

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    describe('Callback API', function () {
      this.timeout(100 * 1000)

      describe('.add', () => {
        it('returns an error when called with an invalid arg', (done) => {
          ipfs.bootstrap.add(invalidArg, (err) => {
            expect(err).to.be.an.instanceof(Error)
            done()
          })
        })

        it('returns a list of containing the bootstrap peer when called with a valid arg (ip4)', (done) => {
          ipfs.bootstrap.add(validIp4, (err, res) => {
            expect(err).to.not.exist()
            expect(res).to.be.eql({ Peers: [validIp4] })
            peers = res.Peers
            expect(peers).to.exist()
            expect(peers.length).to.eql(1)
            done()
          })
        })

        it('returns a list of bootstrap peers when called with the default option', (done) => {
          ipfs.bootstrap.add({ default: true }, (err, res) => {
            expect(err).to.not.exist()
            peers = res.Peers
            expect(peers).to.exist()
            expect(peers.length).to.above(1)
            done()
          })
        })
      })

      describe('.list', () => {
        it('returns a list of peers', (done) => {
          ipfs.bootstrap.list((err, res) => {
            expect(err).to.not.exist()
            peers = res.Peers
            expect(peers).to.exist()
            done()
          })
        })
      })

      describe('.rm', () => {
        it('returns an error when called with an invalid arg', (done) => {
          ipfs.bootstrap.rm(invalidArg, (err) => {
            expect(err).to.be.an.instanceof(Error)
            done()
          })
        })

        it('returns empty list because no peers removed when called without an arg or options', (done) => {
          ipfs.bootstrap.rm(null, (err, res) => {
            expect(err).to.not.exist()
            peers = res.Peers
            expect(peers).to.exist()
            expect(peers.length).to.eql(0)
            done()
          })
        })

        it('returns list containing the peer removed when called with a valid arg (ip4)', (done) => {
          ipfs.bootstrap.rm(null, (err, res) => {
            expect(err).to.not.exist()
            peers = res.Peers
            expect(peers).to.exist()
            expect(peers.length).to.eql(0)
            done()
          })
        })

        it('returns list of all peers removed when all option is passed', (done) => {
          ipfs.bootstrap.rm(null, { all: true }, (err, res) => {
            expect(err).to.not.exist()
            peers = res.Peers
            expect(peers).to.exist()
            done()
          })
        })
      })
    })

    describe('Promise API', function () {
      this.timeout(100 * 1000)

      describe('.add', () => {
        it('returns an error when called without args or options', () => {
          return ipfs.bootstrap.add(null)
            .catch((err) => {
              expect(err).to.be.an.instanceof(Error)
            })
        })

        it('returns an error when called with an invalid arg', () => {
          return ipfs.bootstrap.add(invalidArg)
            .catch((err) => {
              expect(err).to.be.an.instanceof(Error)
            })
        })

        it('returns a list of peers when called with a valid arg (ip4)', () => {
          return ipfs.bootstrap.add(validIp4)
            .then((res) => {
              expect(res).to.be.eql({ Peers: [validIp4] })
              peers = res.Peers
              expect(peers).to.exist()
              expect(peers.length).to.eql(1)
            })
        })

        it('returns a list of default peers when called with the default option', () => {
          return ipfs.bootstrap.add(null, { default: true })
            .then((res) => {
              peers = res.Peers
              expect(peers).to.exist()
              expect(peers.length).to.above(1)
            })
        })
      })

      describe('.list', () => {
        it('returns a list of peers', () => {
          return ipfs.bootstrap.list()
            .then((res) => {
              peers = res.Peers
              expect(peers).to.exist()
            })
        })
      })

      describe('.rm', () => {
        it('returns an error when called with an invalid arg', () => {
          return ipfs.bootstrap.rm(invalidArg)
            .catch((err) => {
              expect(err).to.be.an.instanceof(Error)
            })
        })

        it('returns empty list when called without an arg or options', () => {
          return ipfs.bootstrap.rm(null)
            .then((res) => {
              peers = res.Peers
              expect(peers).to.exist()
              expect(peers.length).to.eql(0)
            })
        })

        it('returns list containing the peer removed when called with a valid arg (ip4)', () => {
          return ipfs.bootstrap.rm(null)
            .then((res) => {
              peers = res.Peers
              expect(peers).to.exist()
              expect(peers.length).to.eql(0)
            })
        })

        it('returns list of all peers removed when all option is passed', () => {
          return ipfs.bootstrap.rm(null, { all: true })
            .then((res) => {
              peers = res.Peers
              expect(peers).to.exist()
            })
        })
      })
    })
  })
}
