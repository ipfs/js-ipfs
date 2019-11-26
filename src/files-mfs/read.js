/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.read', function () {
    this.timeout(60 * 1000)

    let ipfs

    before(async () => { ipfs = await common.setup() })

    after(() => common.teardown())

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

      const buf = await ipfs.files.read(`${testDir}/a`)

      expect(buf).to.eql(Buffer.from('Hello, world!'))
    })

    it('should read from outside of mfs', async () => {
      const [{
        hash
      }] = await ipfs.add(fixtures.smallFile.data)
      const testFileData = await ipfs.files.read(`/ipfs/${hash}`)
      expect(testFileData).to.eql(fixtures.smallFile.data)
    })
  })
}
