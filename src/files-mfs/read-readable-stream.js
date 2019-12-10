/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const getStream = require('get-stream')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.readReadableStream', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should not read not found, expect error', () => {
      const testDir = `/test-${hat()}`
      const stream = ipfs.files.readReadableStream(`${testDir}/404`)

      return expect(getStream(stream)).to.eventually.be.rejected
        .and.be.an.instanceOf(Error)
        .and.have.property('message')
        .that.include('does not exist')
    })

    it('should read file', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(testDir)
      await ipfs.files.write(`${testDir}/a`, Buffer.from('Hello, world!'), { create: true })

      const stream = ipfs.files.readReadableStream(`${testDir}/a`)

      const buf = await getStream(stream)
      expect(buf).to.eql('Hello, world!')
    })
  })
}
