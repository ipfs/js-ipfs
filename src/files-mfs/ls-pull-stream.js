/* eslint-env mocha */
'use strict'

const hat = require('hat')
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

  describe('.files.lsPullStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(pullToPromise.any(ipfs.files.lsPullStream(`${testDir}/404`))).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('does not exist')
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await pullToPromise.any(ipfs.files.lsPullStream(testDir))

      expect(entries).to.have.lengthOf(2)
      expect(entries).to.have.nested.property('[0].name', 'b')
      expect(entries).to.have.nested.property('[0].type', 0)
      expect(entries).to.have.nested.property('[0].size', 0)
      expect(entries).to.have.nested.property('[0].hash', '')
      expect(entries).to.have.nested.property('[1].name', 'lv1')
      expect(entries).to.have.nested.property('[1].type', 0)
      expect(entries).to.have.nested.property('[1].size', 0)
      expect(entries).to.have.nested.property('[1].hash', '')
    })

    it('should ls directory with long option', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await pullToPromise.any(ipfs.files.lsPullStream(testDir, { long: true }))

      expect(entries).to.have.lengthOf(2)
      expect(entries).to.have.nested.property('[0].name', 'b')
      expect(entries).to.have.nested.property('[0].type', 0)
      expect(entries).to.have.nested.property('[0].size', 13)
      expect(entries).to.have.nested.property('[0].hash', 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T')
      expect(entries).to.have.nested.property('[1].name', 'lv1')
      expect(entries).to.have.nested.property('[1].type', 1)
      expect(entries).to.have.nested.property('[1].size', 0)
      expect(entries).to.have.nested.property('[1].hash', 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })
  })
}
