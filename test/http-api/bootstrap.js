/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

describe('bootstrap endpoint', () => {
  let ipfs = null
  let ipfsd = null
  before(function (done) {
    this.timeout(20 * 1000)

    df.spawn({
      initOptions: { bits: 512 },
      config: {
        Bootstrap: [],
        Discovery: {
          MDNS: {
            Enabled: false
          },
          webRTCStar: {
            Enabled: false
          }
        }
      }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('.bootstrap', () => {
    const invalidArg = 'this/Is/So/Invalid/'
    const validIp4 = '/ip4/101.236.176.52/tcp/4001/ipfs/QmSoLnSGccFuZQJzRadHn95W2CrSFmZuTdDWP8HXaHca9z'
    let peers

    describe('.add', function () {
      this.timeout(40 * 1000)

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
          done()
        })
      })

      it('prevents duplicate inserts of bootstrap peers', () => {
        return ipfs
          .bootstrap
          .rm(null, { all: true })
          .then((res) => {
            expect(res.Peers.length).to.equal(0)
            return ipfs.bootstrap.add(validIp4)
          })
          .then(res => {
            expect(res).to.be.eql({ Peers: [validIp4] })
            return ipfs.bootstrap.add(validIp4)
          })
          .then((res) => {
            expect(res).to.be.eql({ Peers: [validIp4] })
            return ipfs.bootstrap.list()
          })
          .then((res) => {
            expect(res).to.exist()
            const insertPosition = res.Peers.indexOf(validIp4)
            expect(insertPosition).to.not.equal(-1)
            expect(res.Peers.length).to.equal(1)
          })
      })

      it('returns a list of bootstrap peers when called with the default option', (done) => {
        ipfs.bootstrap.add({ default: true }, (err, res) => {
          expect(err).to.not.exist()
          peers = res.Peers
          expect(peers).to.exist()
          expect(peers.length).to.be.above(1)
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
        ipfs.bootstrap.rm(validIp4, (err, res) => {
          expect(err).to.not.exist()

          peers = res.Peers
          expect(peers).to.exist()
          expect(peers.length).to.eql(1)
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
})
