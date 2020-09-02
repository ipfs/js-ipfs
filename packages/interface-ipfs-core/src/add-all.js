/* eslint-env mocha, browser */
'use strict'

const { fixtures } = require('./utils')
const { Readable } = require('readable-stream')
const all = require('it-all')
const last = require('it-last')
const drain = require('it-drain')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { supportsFileReader } = require('ipfs-utils/src/supports')
const globSource = require('ipfs-utils/src/files/glob-source')
const { isNode } = require('ipfs-utils/src/env')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const testTimeout = require('./utils/test-timeout')
const uint8ArrayFromString = require('uint8arrays/from-string')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.addAll', function () {
    this.timeout(40 * 1000)

    let ipfs

    async function testMode (mode, expectedMode) {
      const content = String(Math.random() + Date.now())
      const files = await all(ipfs.addAll([{
        content: uint8ArrayFromString(content),
        mode
      }]))
      expect(files).to.have.length(1)
      expect(files).to.have.nested.property('[0].mode', expectedMode)

      const stats = await ipfs.files.stat(`/ipfs/${files[0].cid}`)
      expect(stats).to.have.property('mode', expectedMode)
    }

    async function testMtime (mtime, expectedMtime) {
      const content = String(Math.random() + Date.now())
      const files = await all(ipfs.addAll({
        content: uint8ArrayFromString(content),
        mtime
      }))
      expect(files).to.have.length(1)
      expect(files).to.have.deep.nested.property('[0].mtime', expectedMtime)

      const stats = await ipfs.files.stat(`/ipfs/${files[0].cid}`)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should respect timeout option when adding files', () => {
      return testTimeout(() => drain(ipfs.addAll(uint8ArrayFromString('Hello'), {
        timeout: 1
      })))
    })

    it('should add a File as array of tuples', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      const filesAdded = await all(ipfs.addAll([tuple]))
      expect(filesAdded[0].cid.toString()).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a Uint8Array as array of tuples', async () => {
      const tuple = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.addAll([tuple]))
      expect(filesAdded).to.have.length(1)

      const file = filesAdded[0]
      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid)
      expect(file.path).to.equal('testfile.txt')
    })

    it('should add array of objects with readable stream content', async function () {
      if (!isNode) this.skip()
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(uint8ArrayFromString('some data'))
      rs.push(null)

      const tuple = { path: 'data.txt', content: rs }

      const filesAdded = await all(ipfs.addAll([tuple]))
      expect(filesAdded).to.be.length(1)

      const file = filesAdded[0]
      expect(file.path).to.equal('data.txt')
      expect(file.size).to.equal(17)
      expect(file.cid.toString()).to.equal(expectedCid)
    })

    it('should add a nested directory as array of tupples', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const root = await last(ipfs.addAll(dirs))

      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal(fixtures.directory.cid)
    })

    it('should add a nested directory as array of tupples with progress', async function () {
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      const emptyDir = (name) => ({ path: `test-folder/${name}` })

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt'),
        content('alice.txt'),
        emptyDir('empty-folder'),
        content('files/hello.txt'),
        content('files/ipfs.txt'),
        emptyDir('files/empty')
      ]

      const total = dirs.reduce((i, entry) => {
        return i + (entry.content ? entry.content.length : 0)
      }, 0)

      let progCalled = false
      let accumProgress = 0
      const handler = (p) => {
        progCalled = true
        accumProgress += p
      }

      const root = await last(ipfs.addAll(dirs, { progress: handler }))
      expect(progCalled).to.be.true()
      expect(accumProgress).to.be.at.least(total)
      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal(fixtures.directory.cid)
    })

    it('should add files to a directory non sequentially', async function () {
      const content = path => ({
        path: `test-dir/${path}`,
        content: fixtures.directory.files[path.split('/').pop()]
      })

      const input = [
        content('a/pp.txt'),
        content('a/holmes.txt'),
        content('b/jungle.txt'),
        content('a/alice.txt')
      ]

      const filesAdded = await all(ipfs.addAll(input))

      const toPath = ({ path }) => path
      const nonSeqDirFilePaths = input.map(toPath).filter(p => p.includes('/a/'))
      const filesAddedPaths = filesAdded.map(toPath)

      expect(nonSeqDirFilePaths.every(p => filesAddedPaths.includes(p))).to.be.true()
    })

    it('should fail when passed invalid input', async () => {
      const nonValid = 138

      await expect(all(ipfs.addAll(nonValid))).to.eventually.be.rejected()
    })

    it('should wrap content in a directory', async () => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.addAll(data, { wrapWithDirectory: true }))
      expect(filesAdded).to.have.length(2)

      const file = filesAdded[0]
      const wrapped = filesAdded[1]
      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid)
      expect(file.path).to.equal('testfile.txt')
      expect(wrapped.path).to.equal('')
    })

    it('should add a directory with only-hash=true', async function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())

      const files = await all(ipfs.addAll([{
        path: '/foo/bar.txt',
        content: uint8ArrayFromString(content)
      }, {
        path: '/foo/baz.txt',
        content: uint8ArrayFromString(content)
      }], { onlyHash: true }))
      expect(files).to.have.length(3)

      await Promise.all(
        files.map(file => expect(ipfs.object.get(file.cid, { timeout: 4000 }))
          .to.eventually.be.rejected()
          .and.to.have.property('name').that.equals('TimeoutError')
        )
      )
    })

    it('should add with mode as string', async function () {
      this.slow(10 * 1000)
      const mode = '0777'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should add with mode as number', async function () {
      this.slow(10 * 1000)
      const mode = parseInt('0777', 8)
      await testMode(mode, mode)
    })

    it('should add with mtime as Date', async function () {
      this.slow(10 * 1000)
      const mtime = new Date(5000)
      await testMtime(mtime, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should add with mtime as { nsecs, secs }', async function () {
      this.slow(10 * 1000)
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should add with mtime as timespec', async function () {
      this.slow(10 * 1000)
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should add with mtime as hrtime', async function () {
      this.slow(10 * 1000)
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })

    it('should add a directory from the file system', async function () {
      if (!isNode) this.skip()
      const filesPath = path.join(__dirname, '..', 'test', 'fixtures', 'test-folder')

      const result = await all(ipfs.addAll(globSource(filesPath, { recursive: true })))
      expect(result.length).to.be.above(8)
    })

    it('should add a directory from the file system with an odd name', async function () {
      if (!isNode) this.skip()

      const filesPath = path.join(__dirname, '..', 'test', 'fixtures', 'weird name folder [v0]')

      const result = await all(ipfs.addAll(globSource(filesPath, { recursive: true })))
      expect(result.length).to.be.above(8)
    })

    it('should ignore a directory from the file system', async function () {
      if (!isNode) this.skip()

      const filesPath = path.join(__dirname, '..', 'test', 'fixtures', 'test-folder')

      const result = await all(ipfs.addAll(globSource(filesPath, { recursive: true, ignore: ['files/**'] })))
      expect(result.length).to.be.below(9)
    })

    it('should add a file from the file system', async function () {
      if (!isNode) this.skip()

      const filePath = path.join(__dirname, '..', 'test', 'fixtures', 'testfile.txt')

      const result = await all(ipfs.addAll(globSource(filePath)))
      expect(result.length).to.equal(1)
      expect(result[0].path).to.equal('testfile.txt')
    })

    it('should add a hidden file in a directory from the file system', async function () {
      if (!isNode) this.skip()

      const filesPath = path.join(__dirname, '..', 'test', 'fixtures', 'hidden-files-folder')

      const result = await all(ipfs.addAll(globSource(filesPath, { recursive: true, hidden: true })))
      expect(result.length).to.be.above(10)
      expect(result.map(object => object.path)).to.include('hidden-files-folder/.hiddenTest.txt')
      expect(result.map(object => object.cid.toString())).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
    })

    it('should add a file from the file system with only-hash=true', async function () {
      if (!isNode) this.skip()

      this.slow(10 * 1000)

      const content = String(Math.random() + Date.now())
      const filepath = path.join(os.tmpdir(), `${content}.txt`)
      fs.writeFileSync(filepath, content)

      const out = await all(ipfs.addAll(globSource(filepath), { onlyHash: true }))

      fs.unlinkSync(filepath)

      await expect(ipfs.object.get(out[0].cid, { timeout: 500 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
    })

    it('should respect raw leaves when file is smaller than one block and no metadata is present', async () => {
      const files = await all(ipfs.addAll(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1,
        rawLeaves: true
      }))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(files[0].cid.codec).to.equal('raw')
      expect(files[0].size).to.equal(3)
    })

    it('should override raw leaves when file is smaller than one block and metadata is present', async () => {
      const files = await all(ipfs.addAll({
        content: Uint8Array.from([0, 1, 2]),
        mode: 0o123,
        mtime: {
          secs: 1000,
          nsecs: 0
        }
      }, {
        cidVersion: 1,
        rawLeaves: true
      }))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('bafybeifmayxiu375ftlgydntjtffy5cssptjvxqw6vyuvtymntm37mpvua')
      expect(files[0].cid.codec).to.equal('dag-pb')
      expect(files[0].size).to.equal(18)
    })
  })
}
