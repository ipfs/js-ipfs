/* eslint-env mocha */
'use strict'

const { Readable } = require('readable-stream')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const { fixtures } = require('./utils')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.addFromStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should add from a stream', async () => {
      const stream = new Readable({
        read () {
          this.push(fixtures.bigFile.data)
          this.push(null)
        }
      })

      const result = await ipfs.addFromStream(stream)
      expect(result.length).to.equal(1)
      expect(result[0].hash).to.equal(fixtures.bigFile.cid)
    })
  })
}
