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

describe('files', () => {
  let ipfsd, ipfs

  before(function (done) {
    this.timeout(20 * 1000)

    const factory = IPFSFactory.create({ type: 'proc' })

    factory.spawn({
      exec: IPFS,
      initOptions: { bits: 512 }
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

  describe('get', () => {
    it('should callback with error for invalid IPFS path input', (done) => {
      const invalidPath = null
      ipfs.files.get(invalidPath, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PATH')
        done()
      })
    })
  })

  describe('getReadableStream', () => {
    it('should return erroring stream for invalid IPFS path input', (done) => {
      const invalidPath = null
      const stream = ipfs.files.getReadableStream(invalidPath)

      stream.on('error', (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PATH')
        done()
      })
    })
  })

  describe('getPullStream', () => {
    it('should return erroring stream for invalid IPFS path input', (done) => {
      const invalidPath = null
      pull(
        ipfs.files.getPullStream(invalidPath),
        pull.collect((err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_PATH')
          done()
        })
      )
    })
  })
})
