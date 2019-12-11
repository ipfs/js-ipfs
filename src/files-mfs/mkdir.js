/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.mkdir', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should make directory on root', () => {
      const testDir = `/test-${hat()}`

      return ipfs.files.mkdir(testDir)
    })

    it('should make directory and its parents', () => {
      const testDir = `/test-${hat()}`

      return ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true })
    })

    it('should not make already existent directory', () => {
      return expect(ipfs.files.mkdir('/')).to.eventually.be.rejected()
    })
  })
}
