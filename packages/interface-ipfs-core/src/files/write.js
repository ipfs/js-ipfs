/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { nanoid } from 'nanoid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { isNode } from 'ipfs-utils/src/env.js'
import { sha512 } from 'multiformats/hashes/sha2'
import { traverseLeafNodes } from '../utils/traverse-leaf-nodes.js'
import { createShardedDirectory } from '../utils/create-sharded-directory.js'
import { createTwoShards } from '../utils/create-two-shards.js'
import { randomBytes, randomStream } from 'iso-random-stream'
import all from 'it-all'
import isShardAtPath from '../utils/is-shard-at-path.js'
import * as raw from 'multiformats/codecs/raw'
import map from 'it-map'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testWrite (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)
  const smallFile = randomBytes(13)
  const largeFile = randomBytes(490668)

  /**
   * @param {(arg: { type: string, path: string, content: Uint8Array | AsyncIterable<Uint8Array>, contentSize: number }) => void} fn
   */
  const runTest = (fn) => {
    const iterations = 5
    const files = [{
      type: 'Small file',
      path: `/small-file-${Math.random()}.txt`,
      content: smallFile,
      contentSize: smallFile.length
    }, {
      type: 'Large file',
      path: `/large-file-${Math.random()}.jpg`,
      content: largeFile,
      contentSize: largeFile.length
    }, {
      type: 'Really large file',
      path: `/really-large-file-${Math.random()}.jpg`,
      content: {
        [Symbol.asyncIterator]: function * () {
          for (let i = 0; i < iterations; i++) {
            yield largeFile
          }
        }
      },
      contentSize: largeFile.length * iterations
    }]

    files.forEach((file) => {
      fn(file)
    })
  }

  describe('.files.write', function () {
    this.timeout(300 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    /**
     * @param {number | string} mode
     * @param {number} expectedMode
     */
    async function testMode (mode, expectedMode) {
      const testPath = `/test-${nanoid()}`

      await ipfs.files.write(testPath, uint8ArrayFromString('Hello, world!'), {
        create: true,
        parents: true,
        mode
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.property('mode', expectedMode)
    }

    /**
     * @param {import('ipfs-unixfs').MtimeLike} mtime
     * @param {import('ipfs-unixfs').MtimeLike} expectedMtime
     */
    async function testMtime (mtime, expectedMtime) {
      const testPath = `/test-${nanoid()}`

      await ipfs.files.write(testPath, uint8ArrayFromString('Hello, world!'), {
        create: true,
        parents: true,
        mtime
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => {
      ipfs = (await factory.spawn()).api
    })

    after(() => factory.clean())

    it('explodes if it cannot convert content to a source', async () => {
      // @ts-expect-error invalid arg
      await expect(ipfs.files.write('/foo-bad-source', -1, {
        create: true
      })).to.eventually.be.rejected()
    })

    it('explodes if given an invalid path', async () => {
      // @ts-expect-error invalid arg
      await expect(ipfs.files.write('foo-no-slash', null, {
        create: true
      })).to.eventually.be.rejected()
    })

    it('explodes if given a negative offset', async () => {
      await expect(ipfs.files.write('/foo-negative-offset', uint8ArrayFromString('foo'), {
        offset: -1
      })).to.eventually.be.rejected()
    })

    it('explodes if given a negative length', async () => {
      await expect(ipfs.files.write('/foo-negative-length', uint8ArrayFromString('foo'), {
        length: -1
      })).to.eventually.be.rejected()
    })

    it('creates a zero length file when passed a zero length', async () => {
      const path = '/foo-zero-length'
      await ipfs.files.write(path, uint8ArrayFromString('foo'), {
        length: 0,
        create: true
      })

      await expect(all(ipfs.files.ls(path))).to.eventually.have.lengthOf(1)
        .and.to.have.nested.property('[0]').that.include({
          name: 'foo-zero-length',
          size: 0
        })
    })

    it('writes a small file using a buffer', async () => {
      const filePath = `/small-file-${Math.random()}.txt`

      await ipfs.files.write(filePath, smallFile, {
        create: true
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.property('size', smallFile.length)
      expect(uint8ArrayConcat(await all(ipfs.files.read(filePath)))).to.deep.equal(smallFile)
    })

    it('writes a small file using a string', async function () {
      const filePath = `/string-${Math.random()}.txt`
      const content = 'hello world'

      await ipfs.files.write(filePath, content, {
        create: true
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.property('size', content.length)
      expect(uint8ArrayConcat(await all(ipfs.files.read(filePath)))).to.deep.equal(uint8ArrayFromString(content))
    })

    it('writes part of a small file using a string', async function () {
      const filePath = `/string-${Math.random()}.txt`
      const content = 'hello world'

      await ipfs.files.write(filePath, content, {
        create: true,
        length: 2
      })

      const stats = await ipfs.files.stat(filePath)

      expect(stats.size).to.equal(2)
    })

    it('writes a small file using a Node stream (Node only)', async function () {
      if (!isNode) {
        // @ts-ignore this is mocha
        this.skip()
      }
      const filePath = `/small-file-${Math.random()}.txt`
      const stream = randomStream(1000)

      await ipfs.files.write(filePath, stream, {
        create: true
      })

      const stats = await ipfs.files.stat(filePath)

      expect(stats.size).to.equal(1000)
    })

    it('writes a small file using an HTML5 Blob (Browser only)', async function () {
      if (!global.Blob) {
        // @ts-ignore this is mocha
        return this.skip()
      }

      const filePath = `/small-file-${Math.random()}.txt`
      const blob = new global.Blob([smallFile.buffer.slice(smallFile.byteOffset, smallFile.byteOffset + smallFile.byteLength)])

      await ipfs.files.write(filePath, blob, {
        create: true
      })

      const stats = await ipfs.files.stat(filePath)

      expect(stats.size).to.equal(smallFile.length)
    })

    it('writes a small file with an escaped slash in the title', async () => {
      const filePath = `/small-\\/file-${Math.random()}.txt`

      await ipfs.files.write(filePath, smallFile, {
        create: true
      })

      const stats = await ipfs.files.stat(filePath)

      expect(stats.size).to.equal(smallFile.length)

      await expect(ipfs.files.stat('/small-\\')).to.eventually.rejectedWith(/does not exist/)
    })

    it('writes a deeply nested small file', async () => {
      const filePath = '/foo/bar/baz/qux/quux/garply/small-file.txt'

      await ipfs.files.write(filePath, smallFile, {
        create: true,
        parents: true
      })

      const stats = await ipfs.files.stat(filePath)

      expect(stats.size).to.equal(smallFile.length)
    })

    it('refuses to write to a file in a folder that does not exist', async () => {
      const filePath = `/${Math.random()}/small-file.txt`

      try {
        await ipfs.files.write(filePath, smallFile, {
          create: true
        })
        throw new Error('Writing a file to a non-existent folder without the --parents flag should have failed')
      } catch (/** @type {any} */ err) {
        expect(err.message).to.contain('does not exist')
      }
    })

    it('refuses to write to a file that does not exist', async () => {
      const filePath = `/small-file-${Math.random()}.txt`

      try {
        await ipfs.files.write(filePath, smallFile)
        throw new Error('Writing a file to a non-existent file without the --create flag should have failed')
      } catch (/** @type {any} */ err) {
        expect(err.message).to.contain('file does not exist')
      }
    })

    it('refuses to write to a path that has a file in it', async () => {
      const filePath = `/small-file-${Math.random()}.txt`

      await ipfs.files.write(filePath, Uint8Array.from([0, 1, 2, 3]), {
        create: true
      })

      try {
        await ipfs.files.write(`${filePath}/other-file-${Math.random()}.txt`, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        throw new Error('Writing a path with a file in it should have failed')
      } catch (/** @type {any} */ err) {
        expect(err.message).to.contain('Not a directory')
      }
    })

    runTest(({ type, path, content }) => {
      it(`limits how many bytes to write to a file (${type})`, async () => {
        await ipfs.files.write(path, content, {
          create: true,
          parents: true,
          length: 2
        })

        const bytes = uint8ArrayConcat(await all(ipfs.files.read(path)))

        expect(bytes.length).to.equal(2)
      })
    })

    runTest(({ type, path, content, contentSize }) => {
      it(`overwrites start of a file without truncating (${type})`, async () => {
        const newContent = uint8ArrayFromString('Goodbye world')

        await ipfs.files.write(path, content, {
          create: true
        })

        await expect(ipfs.files.stat(path)).to.eventually.have.property('size', contentSize)

        await ipfs.files.write(path, newContent)

        const stats = await ipfs.files.stat(path)
        expect(stats.size).to.equal(contentSize)

        const buffer = uint8ArrayConcat(await all(ipfs.files.read(path, {
          offset: 0,
          length: newContent.length
        })))

        expect(buffer).to.deep.equal(newContent)
      })
    })

    runTest(({ type, path, content, contentSize }) => {
      it(`pads the start of a new file when an offset is specified (${type})`, async () => {
        const offset = 10

        await ipfs.files.write(path, content, {
          offset,
          create: true
        })

        await expect(ipfs.files.stat(path)).to.eventually.have.property('size', offset + contentSize)

        const buffer = uint8ArrayConcat(await all(ipfs.files.read(path, {
          offset: 0,
          length: offset
        })))

        expect(buffer).to.deep.equal(new Uint8Array(offset))
      })
    })

    runTest(({ type, path, content, contentSize }) => {
      it(`expands a file when an offset is specified (${type})`, async () => {
        const offset = contentSize - 1
        const newContent = uint8ArrayFromString('Oh hai!')

        await ipfs.files.write(path, content, {
          create: true
        })

        await ipfs.files.write(path, newContent, {
          offset
        })

        await expect(ipfs.files.stat(path)).to.eventually.have.property('size', contentSize + newContent.length - 1)

        const buffer = uint8ArrayConcat(await all(ipfs.files.read(path, {
          offset: offset
        })))

        expect(buffer).to.deep.equal(newContent)
      })
    })

    runTest(({ type, path, content, contentSize }) => {
      it(`expands a file when an offset is specified and the offset is longer than the file (${type})`, async () => {
        const offset = contentSize + 5
        const newContent = uint8ArrayFromString('Oh hai!')

        await ipfs.files.write(path, content, {
          create: true
        })
        await ipfs.files.write(path, newContent, {
          offset
        })

        await expect(ipfs.files.stat(path)).to.eventually.have.property('size', newContent.length + offset)

        const buffer = uint8ArrayConcat(await all(ipfs.files.read(path)))

        if (!(content instanceof Uint8Array)) {
          content = uint8ArrayConcat(await all(content))
        }

        expect(buffer).to.deep.equal(uint8ArrayConcat([content, Uint8Array.from([0, 0, 0, 0, 0]), newContent]))
      })
    })

    runTest(({ type, path, content }) => {
      it(`truncates a file after writing (${type})`, async () => {
        const newContent = uint8ArrayFromString('Oh hai!')

        await ipfs.files.write(path, content, {
          create: true
        })
        await ipfs.files.write(path, newContent, {
          truncate: true
        })

        await expect(ipfs.files.stat(path)).to.eventually.have.property('size', newContent.length)

        const buffer = uint8ArrayConcat(await all(ipfs.files.read(path)))

        expect(buffer).to.deep.equal(newContent)
      })
    })

    runTest(({ type, path, content }) => {
      it(`writes a file with raw blocks for newly created leaf nodes (${type})`, async () => {
        await ipfs.files.write(path, content, {
          create: true,
          rawLeaves: true
        })

        const stats = await ipfs.files.stat(path)

        let leafCount = 0

        for await (const { cid } of traverseLeafNodes(ipfs, stats.cid)) {
          leafCount++
          expect(cid.code).to.equal(raw.code)
        }

        expect(leafCount).to.be.greaterThan(0)
      })
    })

    it('supports concurrent writes', async function () {
      /** @type {{ name: string, source: ReturnType<randomBytes>}[]} */
      const files = []

      for (let i = 0; i < 10; i++) {
        files.push({
          name: `source-file-${Math.random()}.txt`,
          source: randomBytes(100)
        })
      }

      await Promise.all(
        files.map(({ name, source }) => ipfs.files.write(`/concurrent/${name}`, source, {
          create: true,
          parents: true
        }))
      )

      const listing = await all(ipfs.files.ls('/concurrent'))
      expect(listing.length).to.equal(files.length)

      listing.forEach(listedFile => {
        expect(files.find(file => file.name === listedFile.name))
      })
    })

    it('rewrites really big files', async function () {
      const initialStream = randomBytes(1024 * 300)
      const newDataStream = randomBytes(1024 * 300)

      const fileName = `/rewrite/file-${Math.random()}.txt`

      await ipfs.files.write(fileName, initialStream, {
        create: true,
        parents: true
      })

      await ipfs.files.write(fileName, newDataStream, {
        offset: 0
      })

      const actualBytes = uint8ArrayConcat(await all(ipfs.files.read(fileName)))

      for (let i = 0; i < newDataStream.length; i++) {
        if (newDataStream[i] !== actualBytes[i]) {
          if (initialStream[i] === actualBytes[i]) {
            throw new Error(`Bytes at index ${i} were not overwritten - expected ${newDataStream[i]} actual ${initialStream[i]}`)
          }

          throw new Error(`Bytes at index ${i} not equal - expected ${newDataStream[i]} actual ${actualBytes[i]}`)
        }
      }

      expect(actualBytes).to.deep.equal(newDataStream)
    })

    it('writes a file with a different CID version to the parent', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const fileName = `file-${Math.random()}.txt`
      const filePath = `${directoryPath}/${fileName}`
      const expectedBytes = Uint8Array.from([0, 1, 2, 3])

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, expectedBytes, {
        create: true,
        cidVersion: 1
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.version', 1)

      const actualBytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

      expect(actualBytes).to.deep.equal(expectedBytes)
    })

    it('overwrites a file with a different CID version', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const fileName = `file-${Math.random()}.txt`
      const filePath = `${directoryPath}/${fileName}`
      const expectedBytes = Uint8Array.from([0, 1, 2, 3])

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, Uint8Array.from([5, 6]), {
        create: true,
        cidVersion: 0
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, expectedBytes, {
        cidVersion: 1
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.version', 1)

      const actualBytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

      expect(actualBytes).to.deep.equal(expectedBytes)
    })

    it('partially overwrites a file with a different CID version', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const fileName = `file-${Math.random()}.txt`
      const filePath = `${directoryPath}/${fileName}`

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, Uint8Array.from([5, 6, 7, 8, 9, 10, 11]), {
        create: true,
        cidVersion: 0
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, Uint8Array.from([0, 1, 2, 3]), {
        cidVersion: 1,
        offset: 1
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.version', 1)

      const actualBytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

      expect(actualBytes).to.deep.equal(Uint8Array.from([5, 0, 1, 2, 3, 10, 11]))
    })

    it('writes a file with a different hash function to the parent', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const fileName = `file-${Math.random()}.txt`
      const filePath = `${directoryPath}/${fileName}`
      const expectedBytes = Uint8Array.from([0, 1, 2, 3])

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.write(filePath, expectedBytes, {
        create: true,
        cidVersion: 1,
        hashAlg: 'sha2-512'
      })

      await expect(ipfs.files.stat(filePath)).to.eventually.have.nested.property('cid.multihash.code', sha512.code)

      const actualBytes = uint8ArrayConcat(await all(ipfs.files.read(filePath)))

      expect(actualBytes).to.deep.equal(expectedBytes)
    })

    it('should write file and specify mode as a string', async function () {
      const mode = '0321'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should write file and specify mode as a number', async function () {
      const mode = parseInt('0321', 8)
      await testMode(mode, mode)
    })

    it('should write file and specify mtime as Date', async function () {
      const mtime = new Date()
      const seconds = Math.floor(mtime.getTime() / 1000)
      const expectedMtime = {
        secs: seconds,
        nsecs: (mtime.getTime() - (seconds * 1000)) * 1000
      }
      await testMtime(mtime, expectedMtime)
    })

    it('should write file and specify mtime as { nsecs, secs }', async function () {
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should write file and specify mtime as timespec', async function () {
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should write file and specify mtime as hrtime', async function () {
      const mtime = process.hrtime()
      await testMtime(mtime, {
        secs: mtime[0],
        nsecs: mtime[1]
      })
    })

    describe('with sharding', () => {
      /** @type {import('ipfs-core-types').IPFS} */
      let ipfs

      before(async function () {
        const ipfsd = await factory.spawn({
          ipfsOptions: {
            EXPERIMENTAL: {
              // enable sharding for js
              sharding: true
            },
            config: {
              // enable sharding for go with automatic threshold dropped to the minimum so it shards everything
              Internal: {
                UnixFSShardingSizeThreshold: '1B'
              }
            }
          }
        })
        ipfs = ipfsd.api
      })

      it('shards a large directory when writing too many links to it', async () => {
        const shardSplitThreshold = 10
        const dirPath = `/sharded-dir-${Math.random()}`
        const newFile = `file-${Math.random()}`
        const newFilePath = `/${dirPath}/${newFile}`

        await ipfs.files.mkdir(dirPath, {
          shardSplitThreshold
        })

        for (let i = 0; i < shardSplitThreshold; i++) {
          await ipfs.files.write(`/${dirPath}/file-${Math.random()}`, Uint8Array.from([0, 1, 2, 3]), {
            create: true,
            shardSplitThreshold
          })
        }

        await expect(ipfs.files.stat(dirPath)).to.eventually.have.property('type', 'directory')

        await ipfs.files.write(newFilePath, Uint8Array.from([0, 1, 2, 3]), {
          create: true,
          shardSplitThreshold
        })

        await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(dirPath)).to.eventually.have.property('type', 'directory')

        const files = await all(ipfs.files.ls(dirPath, {
          long: true
        }))

        // new file should be in directory
        expect(files.filter(file => file.name === newFile).pop()).to.be.ok()
      })

      it('results in the same hash as a sharded directory created by the importer when adding a new file', async function () {
        const {
          nextFile,
          dirWithSomeFiles,
          dirPath
        } = await createTwoShards(ipfs, 75)

        await ipfs.files.cp(`/ipfs/${dirWithSomeFiles}`, dirPath)

        await ipfs.files.write(nextFile.path, nextFile.content, {
          create: true
        })

        const stats = await ipfs.files.stat(dirPath)
        const updatedDirCid = stats.cid

        await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
        expect(stats.type).to.equal('directory')
        expect(updatedDirCid.toString()).to.equal('QmbLw9uCrQaFgweMskqMrsVKTwwakSg94GuMT3zht1P7CQ')
      })

      it('results in the same hash as a sharded directory created by the importer when creating a new subshard', async function () {
        const {
          nextFile,
          dirWithSomeFiles,
          dirPath
        } = await createTwoShards(ipfs, 100)

        await ipfs.files.cp(`/ipfs/${dirWithSomeFiles}`, dirPath)

        await ipfs.files.write(nextFile.path, nextFile.content, {
          create: true
        })

        const stats = await ipfs.files.stat(dirPath)
        const updatedDirCid = stats.cid

        expect(updatedDirCid.toString()).to.equal('QmcGTKoaZeMxVenyxnkP2riibE8vSEPobkN1oxvcEZpBW5')
      })

      it('results in the same hash as a sharded directory created by the importer when adding a file to a subshard', async function () {
        const {
          nextFile,
          dirWithSomeFiles,
          dirPath
        } = await createTwoShards(ipfs, 82)

        await ipfs.files.cp(`/ipfs/${dirWithSomeFiles}`, dirPath)

        await ipfs.files.write(nextFile.path, nextFile.content, {
          create: true
        })

        const stats = await ipfs.files.stat(dirPath)
        const updatedDirCid = stats.cid

        await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
        expect(stats.type).to.equal('directory')
        expect(updatedDirCid.toString()).to.deep.equal('QmXeJ4ercHcxdiX7Vxm1Hit9AwsTNXcwCw5Ad32yW2HdHR')
      })

      it('results in the same hash as a sharded directory created by the importer when adding a file to a subshard of a subshard', async function () {
        const {
          nextFile,
          dirWithSomeFiles,
          dirPath
        } = await createTwoShards(ipfs, 2187)

        await ipfs.files.cp(`/ipfs/${dirWithSomeFiles}`, dirPath)

        await ipfs.files.write(nextFile.path, nextFile.content, {
          create: true
        })

        const stats = await ipfs.files.stat(dirPath)
        const updatedDirCid = stats.cid

        await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.true()
        expect(stats.type).to.equal('directory')
        expect(updatedDirCid.toString()).to.deep.equal('QmY4o7GNvr5eZPnT6k6ALp5zkQ4eiUkJQ6eeUNsdSiqS4f')
      })

      it('writes a file to an already sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)

        const newFile = `file-${Math.random()}`
        const newFilePath = `${shardedDirPath}/${newFile}`

        await ipfs.files.write(newFilePath, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        // should still be a sharded directory
        await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.have.property('type', 'directory')

        const files = await all(ipfs.files.ls(shardedDirPath, {
          long: true
        }))

        // new file should be in the directory
        expect(files.filter(file => file.name === newFile).pop()).to.be.ok()

        // should be able to ls new file directly
        await expect(all(ipfs.files.ls(newFilePath, {
          long: true
        }))).to.eventually.not.be.empty()
      })

      it('overwrites a file in a sharded directory when positions do not match', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const newFile = 'file-0.6944395883502592'
        const newFilePath = `${shardedDirPath}/${newFile}`
        const newContent = Uint8Array.from([3, 2, 1, 0])

        await ipfs.files.write(newFilePath, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        // should still be a sharded directory
        await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.have.property('type', 'directory')

        // overwrite the file
        await ipfs.files.write(newFilePath, newContent, {
          create: true
        })

        // read the file back
        const buffer = uint8ArrayConcat(await all(ipfs.files.read(newFilePath)))

        expect(buffer).to.deep.equal(newContent)

        // should be able to ls new file directly
        await expect(all(ipfs.files.ls(newFilePath, {
          long: true
        }))).to.eventually.not.be.empty()
      })

      it('overwrites file in a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const newFile = `file-${Math.random()}`
        const newFilePath = `${shardedDirPath}/${newFile}`
        const newContent = Uint8Array.from([3, 2, 1, 0])

        await ipfs.files.write(newFilePath, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        // should still be a sharded directory
        await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.have.property('type', 'directory')

        // overwrite the file
        await ipfs.files.write(newFilePath, newContent, {
          create: true
        })

        // read the file back
        const buffer = uint8ArrayConcat(await all(ipfs.files.read(newFilePath)))

        expect(buffer).to.deep.equal(newContent)

        // should be able to ls new file directly
        await expect(all(ipfs.files.ls(newFilePath, {
          long: true
        }))).to.eventually.not.be.empty()
      })

      it('overwrites a file in a subshard of a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const newFile = 'file-1a.txt'
        const newFilePath = `${shardedDirPath}/${newFile}`
        const newContent = Uint8Array.from([3, 2, 1, 0])

        await ipfs.files.write(newFilePath, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        // should still be a sharded directory
        await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.have.property('type', 'directory')

        // overwrite the file
        await ipfs.files.write(newFilePath, newContent, {
          create: true
        })

        // read the file back
        const buffer = uint8ArrayConcat(await all(ipfs.files.read(newFilePath)))

        expect(buffer).to.deep.equal(newContent)

        // should be able to ls new file directly
        await expect(all(ipfs.files.ls(newFilePath, {
          long: true
        }))).to.eventually.not.be.empty()
      })

      it('writes a file to a sub-shard of a shard that contains another sub-shard', async () => {
        const data = Uint8Array.from([0, 1, 2])

        await ipfs.files.mkdir('/hamttest-mfs')

        const files = [
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1398.txt',
          'vivanov-sliceart',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1230.txt',
          'methodify',
          'fis-msprd-style-loader_0_13_1',
          'js-form',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1181.txt',
          'node-gr',
          'yanvoidmodule',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1899.txt',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-372.txt',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1032.txt',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-1293.txt',
          'file-0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000-766.txt'
        ]

        for (const path of files) {
          await ipfs.files.write(`/hamttest-mfs/${path}`, data, {
            shardSplitThreshold: 0,
            create: true
          })
        }

        const beforeFiles = await all(map(ipfs.files.ls('/hamttest-mfs'), (entry) => entry.name))

        expect(beforeFiles).to.have.lengthOf(files.length)

        await ipfs.files.write('/hamttest-mfs/supermodule_test', data, {
          shardSplitThreshold: 0,
          create: true
        })

        const afterFiles = await all(map(ipfs.files.ls('/hamttest-mfs'), (entry) => entry.name))

        expect(afterFiles).to.have.lengthOf(beforeFiles.length + 1)
      })
    })
  })
}
