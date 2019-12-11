/* eslint-env mocha */
'use strict'

const { fixtures } = require('./utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getStream = require('get-stream')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.catReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => {
      ipfs = (await common.spawn()).api
      await ipfs.add(fixtures.bigFile.data)
      await ipfs.add(fixtures.smallFile.data)
    })

    after(() => common.clean())

    it('should return a Readable Stream for a CID', async () => {
      const stream = ipfs.catReadableStream(fixtures.bigFile.cid)
      const data = await getStream.buffer(stream)

      expect(data).to.eql(fixtures.bigFile.data)
    })

    it('should export a chunk of a file in a Readable Stream', async () => {
      const offset = 1
      const length = 3

      const stream = ipfs.catReadableStream(fixtures.smallFile.cid, {
        offset,
        length
      })

      const data = await getStream.buffer(stream)
      expect(data.toString()).to.equal('lz ')
    })
  })
}
