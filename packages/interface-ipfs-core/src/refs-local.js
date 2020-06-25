/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const all = require('it-all')
const importer = require('ipfs-unixfs-importer')
const drain = require('it-drain')
const testTimeout = require('./utils/test-timeout')
const CID = require('cids')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.refs.local', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should respect timeout option when listing local refs', () => {
      return testTimeout(() => drain(ipfs.refs.local({
        timeout: 1
      })))
    })

    it('should get local refs', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt')
      ]

      const imported = await all(importer(dirs, ipfs.block))

      // otherwise go-ipfs doesn't show them in the local refs
      await Promise.all(
        imported.map(i => ipfs.pin.add(i.cid))
      )

      const refs = await all(ipfs.refs.local())
      const cids = refs.map(r => r.ref)

      expect(
        cids.find(cid => {
          const multihash = new CID(cid).multihash

          return imported[0].cid.multihash.equals(multihash)
        })
      ).to.be.ok()

      expect(
        cids.find(cid => {
          const multihash = new CID(cid).multihash

          return imported[1].cid.multihash.equals(multihash)
        })
      ).to.be.ok()
    })
  })
}
