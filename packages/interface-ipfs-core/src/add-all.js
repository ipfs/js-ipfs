/* eslint-env mocha, browser */

import { fixtures } from './utils/index.js'
import { Readable } from 'readable-stream'
import all from 'it-all'
import last from 'it-last'
import drain from 'it-drain'
import { supportsFileReader } from 'ipfs-utils/src/supports.js'
import globSource from 'ipfs-utils/src/files/glob-source.js'
import { isNode } from 'ipfs-utils/src/env.js'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from './utils/mocha.js'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import bufferStream from 'it-buffer-stream'
import * as raw from 'multiformats/codecs/raw'
import * as dagPB from '@ipld/dag-pb'
import resolve from 'aegir/utils/resolve.js'
import { sha256, sha512 } from 'multiformats/hashes/sha2'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testAddAll (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.addAll', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    /**
     * @param {string | number} mode
     * @param {number} expectedMode
     */
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

    /**
     * @param {MtimeLike} mtime
     * @param {MtimeLike} expectedMtime
     */
    async function testMtime (mtime, expectedMtime) {
      const content = String(Math.random() + Date.now())
      const files = await all(ipfs.addAll([{
        content: uint8ArrayFromString(content),
        mtime
      }]))
      expect(files).to.have.length(1)
      expect(files).to.have.deep.nested.property('[0].mtime', expectedMtime)

      const stats = await ipfs.files.stat(`/ipfs/${files[0].cid}`)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should add a File as array of tuples', async function () {
      if (!supportsFileReader) {
        // @ts-ignore this is mocha
        return this.skip('skip in node')
      }

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
      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal('testfile.txt')
    })

    it('should add array of objects with readable stream content', async function () {
      if (!isNode) {
        // @ts-ignore this is mocha
        this.skip('Only node supports readable streams')
      }

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
      /**
       * @param {string} name
       */
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      /**
       * @param {string} name
       */
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

      if (!root) {
        throw new Error('Dirs were not loaded')
      }

      expect(root.path).to.equal('test-folder')
      expect(root.cid.toString()).to.equal(fixtures.directory.cid.toString())
    })

    it('should add a nested directory as array of tupples with progress', async function () {
      /**
       * @param {string} name
       */
      const content = (name) => ({
        path: `test-folder/${name}`,
        content: fixtures.directory.files[name]
      })

      /**
       * @param {string} name
       */
      const emptyDir = (name) => ({ path: `test-folder/${name}`, content: undefined })

      /** @type {Record<string, number>} */
      const progressSizes = {}

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

      const total = dirs.reduce((/** @type {Record<string, number>} */ acc, curr) => {
        if (curr.content) {
          acc[curr.path] = curr.content.length
        }

        return acc
      }, {})

      /**
       * @type {import('ipfs-core-types/src/root').AddProgressFn}
       */
      const handler = (bytes, path) => {
        if (path) {
          progressSizes[path] = bytes
        }
      }

      const root = await last(ipfs.addAll(dirs, { progress: handler }))
      expect(progressSizes).to.deep.equal(total)
      expect(root).to.have.property('path', 'test-folder')
      expect(root).to.have.deep.property('cid', fixtures.directory.cid)
    })

    it('should receive progress path as empty string when adding content without paths', async function () {
      /**
       * @param {string} name
       */
      const content = (name) => fixtures.directory.files[name]

      /** @type {Record<string, number>} */
      const progressSizes = {}

      const dirs = [
        content('pp.txt'),
        content('holmes.txt'),
        content('jungle.txt')
      ]

      const total = {
        '': dirs.reduce((acc, curr) => acc + curr.length, 0)
      }

      /**
       * @type {import('ipfs-core-types/src/root').AddProgressFn}
       */
      const handler = (bytes, path) => {
        progressSizes[`${path}`] = bytes
      }

      await drain(ipfs.addAll(dirs, { progress: handler }))
      expect(progressSizes).to.deep.equal(total)
    })

    it('should receive file name from progress event', async () => {
      /** @type {string[]} */
      const receivedNames = []

      /**
       * @type {import('ipfs-core-types/src/root').AddProgressFn}
       */
      function handler (p, name) {
        if (name) {
          receivedNames.push(name)
        }
      }

      await drain(ipfs.addAll([{
        content: 'hello',
        path: 'foo.txt'
      }, {
        content: 'world',
        path: 'bar.txt'
      }], {
        progress: handler,
        wrapWithDirectory: true
      }))

      expect(receivedNames).to.deep.equal(['foo.txt', 'bar.txt'])
    })

    it('should add files to a directory non sequentially', async function () {
      /**
       * @param {string} path
       */
      const content = path => ({
        path: `test-dir/${path}`,
        content: fixtures.directory.files[path.split('/').pop() || '']
      })

      const input = [
        content('a/pp.txt'),
        content('a/holmes.txt'),
        content('b/jungle.txt'),
        content('a/alice.txt')
      ]

      const filesAdded = await all(ipfs.addAll(input))

      /**
       * @param {object} arg
       * @param {string} arg.path
       */
      const toPath = ({ path }) => path
      const nonSeqDirFilePaths = input.map(toPath).filter(p => p.includes('/a/'))
      const filesAddedPaths = filesAdded.map(toPath)

      expect(nonSeqDirFilePaths.every(p => filesAddedPaths.includes(p))).to.be.true()
    })

    it('should fail when passed invalid input', async () => {
      const nonValid = 138

      // @ts-expect-error nonValid is the wrong type
      await expect(all(ipfs.addAll(nonValid))).to.eventually.be.rejected()
    })

    it('should fail when passed single file objects', async () => {
      const nonValid = { content: 'hello world' }

      // @ts-expect-error nonValid is non valid
      await expect(all(ipfs.addAll(nonValid))).to.eventually.be.rejectedWith(/single item passed/)
    })

    it('should fail when passed single strings', async () => {
      const nonValid = 'hello world'

      await expect(all(ipfs.addAll(nonValid))).to.eventually.be.rejectedWith(/single item passed/)
    })

    it('should fail when passed single buffers', async () => {
      const nonValid = uint8ArrayFromString('hello world')

      // @ts-expect-error nonValid is non valid
      await expect(all(ipfs.addAll(nonValid))).to.eventually.be.rejectedWith(/single item passed/)
    })

    it('should wrap content in a directory', async () => {
      const data = { path: 'testfile.txt', content: fixtures.smallFile.data }

      const filesAdded = await all(ipfs.addAll([data], { wrapWithDirectory: true }))
      expect(filesAdded).to.have.length(2)

      const file = filesAdded[0]
      const wrapped = filesAdded[1]
      expect(file.cid.toString()).to.equal(fixtures.smallFile.cid.toString())
      expect(file.path).to.equal('testfile.txt')
      expect(wrapped.path).to.equal('')
    })

    it('should add a directory with only-hash=true', async function () {
      // @ts-ignore this is mocha
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
      // @ts-ignore this is mocha
      this.slow(10 * 1000)
      const mode = '0777'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should add with mode as number', async function () {
      // @ts-ignore this is mocha
      this.slow(10 * 1000)
      const mode = parseInt('0777', 8)
      await testMode(mode, mode)
    })

    it('should add with mtime as Date', async function () {
      // @ts-ignore this is mocha
      this.slow(10 * 1000)
      const mtime = new Date(5000)
      await testMtime(mtime, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should add with mtime as { nsecs, secs }', async function () {
      // @ts-ignore this is mocha
      this.slow(10 * 1000)
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should add with mtime as timespec', async function () {
      // @ts-ignore this is mocha
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
      // @ts-ignore this is mocha
      this.slow(10 * 1000)
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })

    it('should add a directory from the file system', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()
      const filesPath = resolve('test/fixtures/test-folder', 'interface-ipfs-core')

      const result = await all(ipfs.addAll(globSource(filesPath, '**/*')))
      expect(result.length).to.be.above(8)
    })

    it('should add a directory from the file system with an odd name', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()

      const filesPath = resolve('test/fixtures/weird name folder [v0]', 'interface-ipfs-core')

      const result = await all(ipfs.addAll(globSource(filesPath, '**/*')))
      expect(result.length).to.be.above(8)
    })

    it('should ignore a directory from the file system', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()

      const filesPath = resolve('test/fixtures/test-folder', 'interface-ipfs-core')

      const result = await all(ipfs.addAll(globSource(filesPath, '@(!(files*))')))
      expect(result.length).to.equal(6)
    })

    it('should add a file from the file system', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()

      const filePath = resolve('test/fixtures/test-folder', 'interface-ipfs-core')

      const result = await all(ipfs.addAll(globSource(filePath, 'ipfs-add.js')))
      expect(result.length).to.equal(1)
      expect(result[0].path).to.equal('ipfs-add.js')
    })

    it('should add a hidden file in a directory from the file system', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()

      const filesPath = resolve('test/fixtures', 'interface-ipfs-core')

      const result = await all(ipfs.addAll(globSource(filesPath, 'hidden-files-folder/**/*', { hidden: true })))
      expect(result.map(object => object.path)).to.include('hidden-files-folder/.hiddenTest.txt')
      expect(result.map(object => object.cid.toString())).to.include('QmdbAjVmLRdpFyi8FFvjPfhTGB2cVXvWLuK7Sbt38HXrtt')
    })

    it('should add a file with only-hash=true', async function () {
      // @ts-ignore this is mocha
      if (!isNode) this.skip()

      // @ts-ignore this is mocha
      this.slow(10 * 1000)

      const out = await all(ipfs.addAll([{
        content: uint8ArrayFromString('hello world')
      }], { onlyHash: true }))

      await expect(ipfs.object.get(out[0].cid, { timeout: 500 }))
        .to.eventually.be.rejected()
        .and.to.have.property('name').that.equals('TimeoutError')
    })

    it('should add all with sha2-256 by default', async function () {
      const content = String(Math.random() + Date.now())

      const files = await all(ipfs.addAll([content]))

      expect(files).to.have.nested.property('[0].cid.multihash.code', sha256.code)
    })

    it('should add all with a different hashing algorithm', async function () {
      const content = String(Math.random() + Date.now())

      const files = await all(ipfs.addAll([content], { hashAlg: 'sha2-512' }))

      expect(files).to.have.nested.property('[0].cid.multihash.code', sha512.code)
    })

    it('should respect raw leaves when file is smaller than one block and no metadata is present', async () => {
      const files = await all(ipfs.addAll([Uint8Array.from([0, 1, 2])], {
        cidVersion: 1,
        rawLeaves: true
      }))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('bafkreifojmzibzlof6xyh5auu3r5vpu5l67brf3fitaf73isdlglqw2t7q')
      expect(files[0].cid.code).to.equal(raw.code)
      expect(files[0].size).to.equal(3)
    })

    it('should override raw leaves when file is smaller than one block and metadata is present', async () => {
      const files = await all(ipfs.addAll([{
        content: Uint8Array.from([0, 1, 2]),
        mode: 0o123,
        mtime: {
          secs: 1000,
          nsecs: 0
        }
      }], {
        cidVersion: 1,
        rawLeaves: true
      }))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('bafybeifmayxiu375ftlgydntjtffy5cssptjvxqw6vyuvtymntm37mpvua')
      expect(files[0].cid.code).to.equal(dagPB.code)
      expect(files[0].size).to.equal(18)
    })

    it('should add directories with metadata', async () => {
      const files = await all(ipfs.addAll([{
        path: '/foo',
        mode: 0o123,
        mtime: {
          secs: 1000,
          nsecs: 0
        }
      }]))

      expect(files.length).to.equal(1)
      expect(files[0].cid.toString()).to.equal('QmaZTosBmPwo9LQ48ESPCEcNuX2kFxkpXYy8i3rxqBdzRG')
      expect(files[0].cid.code).to.equal(dagPB.code)
      expect(files[0].size).to.equal(11)
    })

    it('should support bidirectional streaming', async function () {
      let progressInvoked = false

      /**
       * @type {import('ipfs-core-types/src/root').AddProgressFn}
       */
      const handler = (bytes, path) => {
        progressInvoked = true
      }

      const source = async function * () {
        yield {
          content: 'hello',
          path: '/file'
        }

        await new Promise((resolve) => {
          const interval = setInterval(() => {
            // we've received a progress result, that means we've received some
            // data from the server before we're done sending data to the server
            // so the streaming is bidirectional and we can finish up
            if (progressInvoked) {
              clearInterval(interval)
              resolve(null)
            }
          }, 10)
        })
      }

      await drain(ipfs.addAll(source(), {
        progress: handler,
        fileImportConcurrency: 1
      }))

      expect(progressInvoked).to.be.true()
    })

    it('should error during add-all stream', async function () {
      const source = async function * () {
        yield {
          content: 'hello',
          path: '/file'
        }

        yield {
          content: 'hello',
          path: '/file'
        }
      }

      await expect(drain(ipfs.addAll(source(), {
        fileImportConcurrency: 1,
        chunker: 'rabin-2048--50' // invalid chunker parameters, validated after the stream starts moving
      }))).to.eventually.be.rejectedWith(/Chunker parameter avg must be an integer/)
    })

    it('should add big files', async function () {
      const totalSize = 1024 * 1024 * 200
      const chunkSize = 1024 * 1024 * 99

      const source = async function * () {
        yield {
          path: '/dir/file-200mb-1',
          content: bufferStream(totalSize, {
            chunkSize
          })
        }

        yield {
          path: '/dir/file-200mb-2',
          content: bufferStream(totalSize, {
            chunkSize
          })
        }
      }

      const results = await all(ipfs.addAll(source()))

      expect(await ipfs.files.stat(`/ipfs/${results[0].cid}`)).to.have.property('size', totalSize)
      expect(await ipfs.files.stat(`/ipfs/${results[1].cid}`)).to.have.property('size', totalSize)
    })
  })
}
