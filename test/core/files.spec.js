/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const hat = require('hat')
const pull = require('pull-stream')
const IPFSFactory = require('ipfsd-ctl')
const IPFS = require('../../src/core')

describe('files', function () {
  this.timeout(10 * 1000)
  let ipfsd, ipfs

  before(async () => {
    const factory = IPFSFactory.create({
      type: 'proc',
      IpfsClient: require('ipfs-http-client')
    })

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

  describe('get', () => {
    it('should callback with error for invalid IPFS path input', (done) => {
      const invalidPath = null
      ipfs.get(invalidPath, (err) => {
        expect(err).to.exist()
        expect(err.code).to.equal('ERR_INVALID_PATH')
        done()
      })
    })
  })

  describe('getReadableStream', () => {
    it('should return erroring stream for invalid IPFS path input', (done) => {
      const invalidPath = null
      const stream = ipfs.getReadableStream(invalidPath)

      stream.on('data', () => {})
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
        ipfs.getPullStream(invalidPath),
        pull.collect((err) => {
          expect(err).to.exist()
          expect(err.code).to.equal('ERR_INVALID_PATH')
          done()
        })
      )
    })
  })

  describe('add', () => {
    it('should not error when passed null options', async () => {
      await ipfs.add(Buffer.from(hat()), null)
    })

    it('should add a file with a v1 CID', async () => {
      const files = await ipfs.add(Buffer.from([0, 1, 2]), {
        cidVersion: 1
      })

      expect(files.length).to.equal(1)
      expect(files[0].hash).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(files[0].size).to.equal(3)
    })

    it('should add a file with a v1 CID and not raw leaves', async () => {
      const files = await ipfs.add(Buffer.from([0, 1, 2]), {
        cidVersion: 1,
        rawLeaves: false
      })

      expect(files.length).to.equal(1)
      expect(files[0].hash).to.equal('bafybeide2caf5we5a7izifzwzz5ds2gla67vsfgrzvbzpnyyirnfzgwf5e')
      expect(files[0].size).to.equal(11)
    })
  })
})
