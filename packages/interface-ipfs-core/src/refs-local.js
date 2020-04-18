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

      // rust-ipfs doesn't yet have pinning api, it'll just list all local cids
      // in /refs/local
      if (common.opts.type !== 'rust') {
        // otherwise go-ipfs doesn't show them in the local refs
        await Promise.all(
          imported.map(i => ipfs.pin.add(i.cid))
        )
      }

      const refs = await all(ipfs.refs.local())

      const expected = [
        'QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn',
        'QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr'
      ]

      const cids = refs.map(r => r.ref)

      for (const alt of expected.map(alternatives)) {
        // allow the cids to be either original or in later cid version.
        let removed = false
        for (const version of alt) {
          const index = cids.indexOf(version)
          if (index === -1) {
            continue
          }
          removed = true
          delete cids[index]
          break
        }
        expect(removed, `failed to remove '${alt[0]}'`).to.be.true()
      }
    })
  })
}

function alternatives (cidstr) {
  const cid = new CID(cidstr)
  if (cid.version === 0) {
    return [cidstr, cid.toV1().toString()]
  }
  return [cidstr]
}
