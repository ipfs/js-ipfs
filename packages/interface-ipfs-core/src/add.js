/* eslint-env mocha, browser */
'use strict'

const { fixtures } = require('./utils')
const { Readable } = require('readable-stream')
const { supportsFileReader } = require('ipfs-utils/src/supports')
const urlSource = require('ipfs-utils/src/files/url-source')
const { isNode } = require('ipfs-utils/src/env')
const { getDescribe, getIt, expect } = require('./utils/mocha')
const echoUrl = (text) => `${process.env.ECHO_SERVER}/download?data=${encodeURIComponent(text)}`
const redirectUrl = (url) => `${process.env.ECHO_SERVER}/redirect?to=${encodeURI(url)}`
const uint8ArrayFromString = require('uint8arrays/from-string')
const last = require('it-last')
const raw = require('multiformats/codecs/raw')
const dagPb = require('@ipld/dag-pb')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.add', function () {
    this.timeout(120 * 1000)

    let ipfs

    async function testMode (mode, expectedMode) {
      const content = String(Math.random() + Date.now())
      const file = await ipfs.add({
        content,
        mode
      })
      expect(file).to.have.property('mode', expectedMode)

      const stats = await ipfs.files.stat(`/ipfs/${file.cid}`)
      expect(stats).to.have.property('mode', expectedMode)
    }

    async function testMtime (mtime, expectedMtime) {
      const content = String(Math.random() + Date.now())
      const file = await ipfs.add({
        content,
        mtime
      })
      expect(file).to.have.deep.property('mtime', expectedMtime)

      const stats = await ipfs.files.stat(`/ipfs/${file.cid}`)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('should add a File', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const fileAdded = await ipfs.add(new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' }))
      expect(fileAdded.cid.toString()).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a File as tuple', async function () {
      if (!supportsFileReader) return this.skip('skip in node')

      const tuple = {
        path: 'filename.txt',
        content: new self.File(['should add a File'], 'filename.txt', { type: 'text/plain' })
      }

      const fileAdded = await ipfs.add(tuple)
      expect(fileAdded.cid.toString()).to.be.eq('QmTVfLxf3qXiJgr4KwG6UBckcNvTqBp93Rwy5f7h3mHsVC')
    })

    it('should add a Uint8Array', async () => {
      const file = await ipfs.add(fixtures.smallFile.data)

      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal(fixtures.smallFile.cid.toString())
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.smallFile.data.length)
    })

    it('should add a BIG Uint8Array', async () => {
      const file = await ipfs.add(fixtures.bigFile.data)

      expect(file.cid.toString()).to.equal(fixtures.bigFile.cid.toString())
      expect(file.path).to.equal(fixtures.bigFile.cid.toString())
      // file.size counts the overhead by IPLD nodes and unixfs protobuf
      expect(file.size).greaterThan(fixtures.bigFile.data.length)
    })

    it('should add a BIG Uint8Array with progress enabled', async () => {
      let progCalled = false
      let accumProgress = 0
      function handler (p) {
        progCalled = true
        accumProgress = p
      }

      const file = await ipfs.add(fixtures.bigFile.data, { progress: handler })

      expect(file.cid.toString()).to.equal(fixtures.bigFile.cid.toString())
      expect(file.path).to.equal(fixtures.bigFile.cid.toString())
      expect(progCalled).to.be.true()
      expect(accumProgress).to.equal(fixtures.bigFile.data.length)
    })

    it('should add an empty file with progress enabled', async () => {
      let progCalled = false
      let accumProgress = 0
      function handler (p) {
        progCalled = true
        accumProgress = p
      }

      const file = await ipfs.add(fixtures.emptyFile.data, { progress: handler })

      expect(file.cid.toString()).to.equal(fixtures.emptyFile.cid.toString())
      expect(file.path).to.equal(fixtures.emptyFile.cid.toString())
      expect(progCalled).to.be.true()
      expect(accumProgress).to.equal(fixtures.emptyFile.data.length)
    })

    it('should receive file name from progress event', async () => {
      let receivedName
      function handler (p, name) {
        receivedName = name
      }

      await ipfs.add({
        content: 'hello',
        path: 'foo.txt'
      }, { progress: handler })

      expect(receivedName).to.equal('foo.txt')
    })

    it('should add an empty file without progress enabled', async () => {
      const file = await ipfs.add(fixtures.emptyFile.data)

      expect(file.cid.toString()).to.equal(fixtures.emptyFile.cid.toString())
      expect(file.path).to.equal(fixtures.emptyFile.cid.toString())
    })

    it('should add a Uint8Array as tuple', async () => {
      const tuple = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const file = await ipfs.add(tuple)

      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal('testfile.txt')
    })

    it('should add a string', async () => {
      const data = 'a string'
      const expectedCid = 'QmQFRCwEpwQZ5aQMqCsCaFbdjNLLHoyZYDjr92v1F7HeqX'

      const file = await ipfs.add(data)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 16)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should add a TypedArray', async () => {
      const data = Uint8Array.from([1, 3, 8])
      const expectedCid = 'QmRyUEkVCuHC8eKNNJS9BDM9jqorUvnQJK1DM81hfngFqd'

      const file = await ipfs.add(data)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 11)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should add readable stream', async function () {
      if (!isNode) this.skip()
      const expectedCid = 'QmVv4Wz46JaZJeH5PMV4LGbRiiMKEmszPYY3g6fjGnVXBS'

      const rs = new Readable()
      rs.push(uint8ArrayFromString('some data'))
      rs.push(null)

      const file = await ipfs.add(rs)

      expect(file).to.have.property('path', expectedCid)
      expect(file).to.have.property('size', 17)
      expect(`${file.cid}`).to.equal(expectedCid)
    })

    it('should fail when passed invalid input', async () => {
      const nonValid = 138

      await expect(ipfs.add(nonValid)).to.eventually.be.rejected()
    })

    it('should wrap content in a directory', async () => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const wrapper = await ipfs.add(data, { wrapWithDirectory: true })
      expect(wrapper.path).to.equal('')

      const stats = await ipfs.files.stat(`/ipfs/${wrapper.cid}/testfile.txt`)

      expect(`${stats.cid}`).to.equal(fixtures.smallFile.cid.toString())
    })

    it('should add with only-hash=true', async function () {
      this.slow(10 * 1000)
      const content = String(Math.random() + Date.now())

      const file = await ipfs.add(content, { onlyHash: true })

      await expect(ipfs.object.get(file.cid, { timeout: 4000 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
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

    it('should add from a HTTP URL', async () => {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url)),
        ipfs.add(text)
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result.cid.toString()).to.equal(expectedResult.cid.toString())
      expect(result.size).to.equal(expectedResult.size)
    })

    it('should add from a HTTP URL with redirection', async () => {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(redirectUrl(url))),
        ipfs.add(text)
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result.cid.toString()).to.equal(expectedResult.cid.toString())
      expect(result.size).to.equal(expectedResult.size)
    })

    it('should add from a URL with only-hash=true', async function () {
      const text = `TEST${Math.random()}`
      const url = echoUrl(text)

      const res = await ipfs.add(urlSource(url), { onlyHash: true })

      await expect(ipfs.object.get(res.cid, { timeout: 500 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
    })

    it('should add from a URL with wrap-with-directory=true', async () => {
      const filename = `TEST${Date.now()}.txt` // also acts as data
      const url = echoUrl(filename)
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url), addOpts),
        ipfs.add({ path: 'download', content: filename }, addOpts)
      ])
      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result).to.deep.equal(expectedResult)
    })

    it('should add from a URL with wrap-with-directory=true and URL-escaped file name', async () => {
      const filename = `320px-Domažlice,_Jiráskova_43_(${Date.now()}).jpg` // also acts as data
      const url = echoUrl(filename)
      const addOpts = { wrapWithDirectory: true }

      const [result, expectedResult] = await Promise.all([
        ipfs.add(urlSource(url), addOpts),
        ipfs.add([{ path: 'download', content: filename }], addOpts)
      ])

      expect(result.err).to.not.exist()
      expect(expectedResult.err).to.not.exist()
      expect(result).to.deep.equal(expectedResult)
    })

    it('should not add from an invalid url', () => {
      return expect(() => ipfs.add(urlSource('123http://invalid'))).to.throw()
    })

    it('should respect raw leaves when file is smaller than one block and no metadata is present', async () => {
      const file = await ipfs.add(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1,
        rawLeaves: true
      })

      expect(file.cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(file.cid.code).to.equal(raw.code)
      expect(file.size).to.equal(3)
    })

    it('should override raw leaves when file is smaller than one block and metadata is present', async () => {
      const file = await ipfs.add({
        content: Uint8Array.from([0, 1, 2]),
        mode: 0o123,
        mtime: {
          secs: 1000,
          nsecs: 0
        }
      }, {
        cidVersion: 1,
        rawLeaves: true
      })

      expect(file.cid.toString()).to.equal('bafybeifmayxiu375ftlgydntjtffy5cssptjvxqw6vyuvtymntm37mpvua')
      expect(file.cid.code).to.equal(dagPb.code)
      expect(file.size).to.equal(18)
    })

    it('should add a file with a v1 CID', async () => {
      const file = await ipfs.add(Uint8Array.from([0, 1, 2]), {
        cidVersion: 1
      })

      expect(file.cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(file.size).to.equal(3)
    })

    const testFiles = Array.from(Array(1005), (_, i) => ({
      path: 'test-folder/' + i,
      content: uint8ArrayFromString('some content ' + i)
    }))

    it('should be able to add dir without sharding', async () => {
      const { path, cid } = await last(ipfs.addAll(testFiles))
      expect(path).to.eql('test-folder')
      expect(cid.toString()).to.eql('QmWWM8ZV6GPhqJ46WtKcUaBPNHN5yQaFsKDSQ1RE73w94Q')
    })

    describe('with sharding', () => {
      let ipfs

      before(async function () {
        const ipfsd = await common.spawn({
          ipfsOptions: {
            EXPERIMENTAL: {
              // enable sharding for js
              sharding: true
            },
            config: {
              // enable sharding for go
              Experimental: {
                ShardingEnabled: true
              }
            }
          }
        })
        ipfs = ipfsd.api
      })

      it('should be able to add dir with sharding', async () => {
        const { path, cid } = await last(ipfs.addAll(testFiles))
        expect(path).to.eql('test-folder')
        expect(cid.toString()).to.eql('Qmb3JNLq2KcvDTSGT23qNQkMrr4Y4fYMktHh6DtC7YatLa')
      })
    })
  })
}
