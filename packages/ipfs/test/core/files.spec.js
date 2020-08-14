/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('aegir/utils/chai')
const { nanoid } = require('nanoid')
const uint8ArrayFromString = require('uint8arrays/from-string')
const all = require('it-all')
const factory = require('../utils/factory')

describe('files', function () {
  this.timeout(10 * 1000)
  const df = factory()
  let ipfsd, ipfs

  before(async () => {
    ipfsd = await df.spawn()
    ipfs = ipfsd.api
  })

  after(() => df.clean())

  describe('get', () => {
    it('should throw an error for invalid IPFS path input', () => {
      const invalidPath = null
      return expect(all(ipfs.get(invalidPath)))
        .to.eventually.be.rejected()
        .and.to.have.property('code').that.equals('ERR_INVALID_PATH')
    })
  })

  describe('add', () => {
    it('should not error when passed null options', async () => {
      await ipfs.add(uint8ArrayFromString(nanoid()), null)
    })

    it('should add a file with a v1 CID', async () => {
      const file = await ipfs.add(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1
      })

      expect(file.cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(file.size).to.equal(3)
    })
  })
})
