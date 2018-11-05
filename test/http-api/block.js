/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const multihash = require('multihashes')
const waterfall = require('async/waterfall')

const DaemonFactory = require('ipfsd-ctl')
const df = DaemonFactory.create({ exec: 'src/cli/bin.js' })

describe('block endpoint', () => {
  let ipfs = null
  let ipfsd = null

  before(function (done) {
    this.timeout(20 * 1000)

    df.spawn({
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
    }, (err, _ipfsd) => {
      expect(err).to.not.exist()
      ipfsd = _ipfsd
      ipfs = ipfsd.api
      done()
    })
  })

  after((done) => ipfsd.stop(done))

  describe('.block', () => {
    describe('.put', () => {
      it('updates value', (done) => {
        const data = Buffer.from('hello world\n')
        const expectedResult = {
          key: 'QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp',
          size: 12
        }

        waterfall([
          (cb) => ipfs.block.put(data, cb),
          (block, cb) => {
            expect(block.cid.multihash).to.eql(
              multihash.fromB58String(expectedResult.key)
            )
            cb()
          }
        ], done)
      })
    })

    describe('.get', () => {
      it('returns error for request with invalid argument', (done) => {
        ipfs.block.get('invalid', (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        ipfs.block.get('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist()
          expect(result.data.toString())
            .to.equal('hello world\n')
          done()
        })
      })
    })

    describe('.stat', () => {
      it('returns error for request without argument', (done) => {
        ipfs.block.stat(null, (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns error for request with invalid argument', (done) => {
        ipfs.block.stat('invalid', (err, result) => {
          expect(err).to.exist()
          done()
        })
      })

      it('returns value', (done) => {
        ipfs.block.stat('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp', (err, result) => {
          expect(err).to.not.exist()
          expect(result.key)
            .to.equal('QmZjTnYw2TFhn9Nn7tjmPSoTBoY7YRkwPzwSrSbabY24Kp')
          expect(result.size).to.equal(12)
          done()
        })
      })
    })
  })
})
