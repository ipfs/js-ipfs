/* eslint-env mocha */
'use strict'

const series = require('async/series')
const hat = require('hat')
const { fixtures } = require('../files-regular/utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')

module.exports = (createCommon, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const common = createCommon()

  describe('.files.cp', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(function (done) {
      // CI takes longer to instantiate the daemon, so we need to increase the
      // timeout for the before step
      this.timeout(60 * 1000)

      common.setup((err, factory) => {
        expect(err).to.not.exist()
        factory.spawnNode((err, node) => {
          expect(err).to.not.exist()
          ipfs = node
          done()
        })
      })
    })

    after((done) => common.teardown(done))

    it('should copy file, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.cp(`${testDir}/c`, `${testDir}/b`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should copy file, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(testDir, { parents: true }, cb),
        (cb) => ipfs.files.write(`${testDir}/a`, Buffer.from('TEST'), { create: true }, cb),
        (cb) => ipfs.files.cp(`${testDir}/a`, `${testDir}/b`, cb)
      ], (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should copy dir, expect error', (done) => {
      const testDir = `/test-${hat()}`

      ipfs.files.cp(`${testDir}/lv1/lv3`, `${testDir}/lv1/lv4`, (err) => {
        expect(err).to.exist()
        done()
      })
    })

    it('should copy dir, expect no error', (done) => {
      const testDir = `/test-${hat()}`

      series([
        (cb) => ipfs.files.mkdir(`${testDir}/lv1/lv2`, { parents: true }, cb),
        (cb) => ipfs.files.cp(`${testDir}/lv1/lv2`, `${testDir}/lv1/lv3`, cb)
      ], (err) => {
        expect(err).to.not.exist()
        done()
      })
    })

    it('should copy from outside of mfs', async () => {
      const [{
        hash
      }] = await ipfs.add(fixtures.smallFile.data)
      const testFilePath = `/${hat()}`
      await ipfs.files.cp(`/ipfs/${hash}`, testFilePath)
      const testFileData = await ipfs.files.read(testFilePath)
      expect(testFileData).to.eql(fixtures.smallFile.data)
    })
  })
}
