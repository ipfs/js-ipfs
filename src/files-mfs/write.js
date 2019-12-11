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

  describe('.files.write', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not write to non existent file, expect error', function () {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'))).to.eventually.be.rejected()
    })

    it('should write to non existent file with create flag', async function () {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true })

      const stats = await ipfs.files.stat(testPath)
      expect(stats.type).to.equal('file')
    })

    it('should write to deeply nested non existent file with create and parents flags', async function () {
      const testPath = `/foo/bar/baz/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), { create: true, parents: true })

      const stats = await ipfs.files.stat(testPath)
      expect(stats.type).to.equal('file')
    })
  })
}
