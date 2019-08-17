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

describe('stats', function () {
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(async () => {
    const factory = IPFSFactory.create({ type: 'proc' })

    ipfsd = await factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] },
      preload: { enabled: false }
    })
    ipfs = ipfsd.api
  })

  after(() => {
    if (ipfsd) {
      return ipfsd.stop()
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
