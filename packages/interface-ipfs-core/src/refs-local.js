/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const createFile = require('./utils/create-file')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const all = require('it-all')
const UnixFS = require('ipfs-unixfs')
const { DAGLink, DAGNode } = require('ipld-dag-pb')

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

    it('should get local refs', async function () {
      const pp = await createFile(ipfs, fixtures.directory.files['pp.txt'])
      const holmes = await createFile(ipfs, fixtures.directory.files['holmes.txt'])
      const directory = new UnixFS({ type: 'directory' })
      const serialized = new DAGNode(directory.marshal(), [
        new DAGLink('pp.txt', pp.cumulativeSize, pp.cid),
        new DAGLink('holmes.txt', holmes.cumulativeSize, holmes.cid)
      ]).serialize()
      await ipfs.block.put(serialized)

      const refs = await all(ipfs.refs.local())

      const cids = refs.map(r => r.ref)
      expect(cids).to.include('QmVwdDCY4SPGVFnNCiZnX5CtzwWDn6kAM98JXzKxE3kCmn')
      expect(cids).to.include('QmR4nFjTu18TyANgC65ArNWp5Yaab1gPzQ4D8zp7Kx3vhr')
    })
  })
}
