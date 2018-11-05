/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const pull = require('pull-stream')
const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('stats', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(20 * 1000)

    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] }
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

  describe('bwPullStream', () => {
    it('should return erroring stream for invalid interval option', (done) => {
      pull(
        ipfs.stats.bwPullStream({ poll: true, interval: 'INVALID INTERVAL' }),
        pull.collect((err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_POLL_INTERVAL')
          done()
        })
      )
    })
  })

  describe('bw', () => {
    it('should not error when passed null options', (done) => {
      ipfs.stats.bw(null, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
})
