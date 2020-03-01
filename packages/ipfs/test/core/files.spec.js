/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { expect } = require('interface-ipfs-core/src/utils/mocha')
const hat = require('hat')
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
      await all(ipfs.add(Buffer.from(hat()), null))
    })

    it('should add a file with a v1 CID', async () => {
      const files = await all(ipfs.add(Buffer.from([0, 1, 2]), {
        cidVersion: 1
      }))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('bafybeide2caf5we5a7izifzwzz5ds2gla67vsfgrzvbzpnyyirnfzgwf5e')
      expect(files[0].size).to.equal(11)
    })
  })
})
