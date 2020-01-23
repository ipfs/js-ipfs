/* eslint-env mocha */
'use strict'

const hat = require('hat')
const concat = require('it-concat')
const all = require('it-all')
const { fixtures } = require('../utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.read', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not read not found, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(ipfs.files.cp(`${testDir}/c`, `${testDir}/b`)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.to.have.property('message')
        .that.include('does not exist')
    })

    it('should read file', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir)
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const buf = await concat(ipfs.files.read(`${testDir}/a`))

      expect(buf.slice()).to.eql(Buffer.from('Hello, world!'))
    })

    it('should read from outside of mfs', async () => {
      const [{ cid }] = await all(ipfs.add(fixtures.smallFile.data))
      const testFileData = await concat(ipfs.files.read(`/ipfs/${cid}`))
      expect(testFileData.slice()).to.eql(fixtures.smallFile.data)
    })
  })
}
