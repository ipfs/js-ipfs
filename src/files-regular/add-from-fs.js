/* eslint-env mocha */
'use strict'

const path = require('path')
const expectTimeout = require('../utils/expect-timeout')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const fs = require('fs')
const os = require('os')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.addFromFs', function () {
    this.timeout(40 * 1000)

    const fixturesPath = path.join(__dirname, '../../test/fixtures')
    let ipfs

    before(async function () {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      ipfs = await common.setup()
    })

    after(() => common.teardown())

    it('should add a directory from the file system', async () => {
      const filesPath = path.join(fixturesPath, 'test-folder')

      const result = await ipfs.addFromFs(filesPath, { recursive: true })
      expect(result.length).to.be.above(8)
    })

    it('should add a directory from the file system with an odd name', async () => {
      const filesPath = path.join(fixturesPath, 'weird name folder [v0]')

      const result = await ipfs.addFromFs(filesPath, { recursive: true })
      expect(result.length).to.be.above(8)
    })

    it('should ignore a directory from the file system', async () => {
      const filesPath = path.join(fixturesPath, 'test-folder')

      const result = await ipfs.addFromFs(filesPath, { recursive: true, ignore: ['files/**'] })
      expect(result.length).to.be.below(9)
    })

    it('should add a file from the file system', async () => {
      const filePath = path.join(fixturesPath, 'testfile.txt')

      const result = await ipfs.addFromFs(filePath)
      expect(result.length).to.equal(1)
      expect(result[0].path).to.equal('testfile.txt')
    })

    it('should add a hidden file in a directory from the file system', async () => {
      const filesPath = path.join(fixturesPath, 'hidden-files-folder')

      const result = await ipfs.addFromFs(filesPath, { recursive: true, hidden: true })
      expect(result.length).to.be.above(10)
      expect(result.map(object => object.path)).to.include('hidden-files-folder/.hiddenTest.txt')
      expect(result.map(object => object.hash)).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
    })

    it('should add a file from the file system with only-hash=true', async function () {
      this.slow(10 * 1000)

      const content = String(Math.random() + Date.now())
      const filepath = path.join(os.tmpdir(), `${content}.txt`)
      fs.writeFileSync(filepath, content)

      const out = await ipfs.addFromFs(filepath, { onlyHash: true })

      fs.unlinkSync(filepath)
      await expectTimeout(ipfs.object.get(out[0].hash), 4000)
    })
  })
}
