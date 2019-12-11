/* eslint-env mocha */
'use strict'

const hat = require('hat')
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

  describe('.files.lsReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`
      const stream = ipfs.files.lsReadableStream(`${testDir}/404`)

      return expect(getStream(stream)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('does not exist')
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.lsReadableStream(testDir)

      const entries = await getStream.array(stream)

      expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
        { name: 'b', type: 0, size: 0, hash: '' },
        { name: 'lv1', type: 0, size: 0, hash: '' }
      ])
    })

    it('should ls directory with long option', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.lsReadableStream(testDir, { long: true })
      const entries = await getStream.array(stream)

      expect(entries.sort((a, b) => a.name.localeCompare(b.name))).to.eql([
        {
          name: 'b',
          type: 0,
          size: 13,
          hash: 'QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T'
        },
        {
          name: 'lv1',
          type: 1,
          size: 0,
          hash: 'QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn'
        }
      ])
    })
  })
}
