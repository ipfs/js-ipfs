/* eslint-env mocha */
'use strict'

const hat = require('hat')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.chmod', function () {
    this.timeout(40 * 1000)

    let ipfs

    async function testMode (mode, expectedMode) {
      const testPath = `/test-${hat()}`

      await ipfs.files.write(testPath, Buffer.from('Hello, world!'), {
        create: true
      })
      await ipfs.files.chmod(testPath, mode)

      const stat = await ipfs.files.stat(testPath)
      expect(stat).to.have.property('mode').that.equals(expectedMode)
    }

    before(async () => {
      ipfs = (await common.spawn()).api
    })

    after(() => common.clean())

    it('should change file mode', async function () {
      const mode = parseInt('544', 8)
      await testMode(mode, mode)
    })

    it('should change file mode as string', async function () {
      const mode = parseInt('544', 8)
      await testMode('544', mode)
    })

    it('should change file mode to 0', async function () {
      const mode = 0
      await testMode(mode, mode)
    })

    it('should change directory mode', async function () {
      const testPath = `/test-${hat()}`
      const mode = parseInt('544', 8)

      await ipfs.files.mkdir(testPath, {
        create: true
      })
      await ipfs.files.chmod(testPath, mode)

      const stat = await ipfs.files.stat(testPath)
      expect(stat).to.have.property('mode').that.equals(mode)
    })
  })
}
