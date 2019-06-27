/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)

const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('swarm', function () {
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(function (done) {
    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 },
      config: { Bootstrap: [] },
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

  describe('peers', () => {
    it('should not error when passed null options', (done) => {
      ipfs.swarm.peers(null, (err) => {
        expect(err).to.not.exist()
        done()
      })
    })
  })
})
