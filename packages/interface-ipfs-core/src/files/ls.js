/* eslint-env mocha */
'use strict'

const hat = require('hat')
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

  describe('.files.ls', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should not ls not found file/dir, expect error', () => {
      const testDir = `/test-${hat()}`

      return expect(all(ipfs.files.ls(`${testDir}/404`))).to.eventually.be.rejected()
    })

    it('should ls directory', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, { parents: true })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), { create: true })

      const entries = await all(ipfs.files.ls(testDir))

      expect(entries).to.have.lengthOf(2)
      expect(entries[0].name).to.equal('b')
      expect(entries[0].type).to.equal(0)
      expect(entries[0].size).to.equal(13)
      expect(entries[0].cid.toString()).to.equal('QmcZojhwragQr5qhTeFAmELik623Z21e3jBTpJXoQ9si1T')
      expect(entries[1].name).to.equal('lv1')
      expect(entries[1].type).to.equal(1)
      expect(entries[1].size).to.equal(0)
      expect(entries[1].cid.toString()).to.equal('QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn')
    })

    it('should ls directory and include metadata', async () => {
      const testDir = `/test-${hat()}`

      await ipfs.files.mkdir(`${testDir}/lv1`, {
        parents: true,
        mtime: {
          secs: 5
        }
      })
      await ipfs.files.write(`${testDir}/b`, Buffer.from('Hello, world!'), {
        create: true,
        mtime: {
          secs: 5
        }
      })

      const entries = await all(ipfs.files.ls(testDir, { long: true }))

      expect(entries).to.have.lengthOf(2)
      expect(entries[0].cid.toString()).to.equal('QmTVnczjg445RUAEYNH1wvhVa2rnPoWMfHMxQc6W7HHoyM')
      expect(entries[0].mode).to.equal(0o0644)
      expect(entries[0].mtime).to.deep.equal({
        secs: 5,
        nsecs: 0
      })
      expect(entries[1].cid.toString()).to.equal('QmXkBjmbtWUxXLa3s541UBSzPgvaAR7b8X3Amcp5D1VKTQ')
      expect(entries[1].mode).to.equal(0o0755)
      expect(entries[1].mtime).to.deep.equal({
        secs: 5,
        nsecs: 0
      })
    })

    it('should ls from outside of mfs', async () => {
      const testFileName = hat()
      const [{
        cid
      }] = await all(ipfs.add({ path: `/test/${testFileName}`, content: fixtures.smallFile.data }))
      const listing = await all(ipfs.files.ls('/ipfs/' + cid))
      expect(listing).to.have.length(1)
      expect(listing[0].name).to.equal(cid.toString())
    })

    it('should list an empty directory', async () => {
      const testDir = `/test-${hat()}`
      await ipfs.files.mkdir(testDir)
      const contents = await all(ipfs.files.ls(testDir))

      expect(contents).to.be.an('array').and.to.be.empty()
    })

    it('should list a file directly', async () => {
      const fileName = `single-file-${hat()}.txt`
      const filePath = `/${fileName}`
      await ipfs.files.write(filePath, Buffer.from('Hello world'), {
        create: true
      })
      const entries = await all(ipfs.files.ls(filePath))

      expect(entries).to.have.lengthOf(1)
      expect(entries[0].name).to.equal(fileName)
      expect(entries[0].type).to.equal(0)
      expect(entries[0].size).to.equal(11)
      expect(entries[0].cid.toString()).to.equal('Qmetpc7cZmN25Wcc6R27cGCAvCDqCS5GjHG4v7xABEfpmJ')
    })
  })
}
