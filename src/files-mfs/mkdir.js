/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.mkdir', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

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
