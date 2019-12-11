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

  describe('.getPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    before(() => ipfs.add(fixtures.smallFile.data))

    after(() => common.clean())

    it('should return a Pull Stream of Pull Streams', async () => {
      const stream = ipfs.getPullStream(fixtures.smallFile.cid)

      const files = await pullToPromise.any(stream)

      const data = Buffer.concat(await pullToPromise.any(files[0].content))
      expect(data.toString()).to.contain('Plz add me!')
    })
  })
}
