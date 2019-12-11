/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const pullToPromise = require('pull-to-promise')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.catPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    before(() => ipfs.add(fixtures.smallFile.data))
    after(() => common.clean())

    it('should return a Pull Stream for a CID', async () => {
      const stream = ipfs.catPullStream(fixtures.smallFile.cid)

      const data = Buffer.concat(await pullToPromise.any(stream))

      expect(data.length).to.equal(fixtures.smallFile.data.length)
      expect(data.toString()).to.deep.equal(fixtures.smallFile.data.toString())
    })

    it('should export a chunk of a file in a Pull Stream', async () => {
      const offset = 1
      const length = 3

      const stream = ipfs.catPullStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      const data = Buffer.concat(await pullToPromise.any(stream))
      expect(data.toString()).to.equal('lz ')
    })
  })
}
