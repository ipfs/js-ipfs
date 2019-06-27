/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const isNode = require('detect-node')

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

// TODO: unskip when DHT is enabled in 0.36
describe.skip('dht', () => {
  describe('enabled', () => {
    let ipfsd, ipfs

    before(function (done) {
      this.timeout(30 * 1000)

      const factory = IPFSFactory.create({ type: 'proc' })

      factory.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        config: {
          Bootstrap: []
        },
        preload: { enabled: false }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = _ipfsd.api
        done()
      })
    })

    after((done) => {
      if (ipfsd) {
        ipfsd.stop(done)
      } else {
        done()
      }
    })

    describe('findprovs', () => {
      it('should callback with error for invalid CID input', (done) => {
        ipfs.dht.findProvs('INVALID CID', (err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_CID')
          done()
        })
      })
    })
  })

  describe('disabled in browser', () => {
    if (isNode) { return }

    let ipfsd, ipfs

    before(function (done) {
      this.timeout(30 * 1000)

      const factory = IPFSFactory.create({ type: 'proc' })

      factory.spawn({
        exec: IPFS,
        initOptions: { bits: 512 },
        config: {
          Bootstrap: []
        }
      }, (err, _ipfsd) => {
        expect(err).to.not.exist()
        ipfsd = _ipfsd
        ipfs = _ipfsd.api
        done()
      })
    })

    after((done) => {
      if (ipfsd) {
        ipfsd.stop(done)
      } else {
        done()
      }
    })

    describe('put', () => {
      it('should callback with error for DHT not available', async () => {
        let res
        try {
          res = await ipfs.dht.put(Buffer.from('a'), Buffer.from('b'))
        } catch (err) {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_DHT_DISABLED')
        }

        expect(res).to.not.exist()
      })
    })
  })
})
