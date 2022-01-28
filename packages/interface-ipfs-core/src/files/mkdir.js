/* eslint-env mocha */

import { nanoid } from 'nanoid'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { sha512 } from 'multiformats/hashes/sha2'
import { createShardedDirectory } from '../utils/create-sharded-directory.js'
import all from 'it-all'
import isShardAtPath from '../utils/is-shard-at-path.js'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testMkdir (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)

  describe('.files.mkdir', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    /**
     * @param {number | string | undefined} mode
     * @param {number} expectedMode
     */
    async function testMode (mode, expectedMode) {
      const testPath = `/test-${nanoid()}`
      await ipfs.files.mkdir(testPath, {
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
      await ipfs.files.mkdir(testPath, {
        mtime
      })

      const stats = await ipfs.files.stat(testPath)
      expect(stats).to.have.deep.property('mtime', expectedMtime)
    }

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('requires a directory', async () => {
      await expect(ipfs.files.mkdir('')).to.eventually.be.rejected()
    })

    it('refuses to create a directory without a leading slash', async () => {
      await expect(ipfs.files.mkdir('foo')).to.eventually.be.rejected()
    })

    it('refuses to recreate the root directory when -p is false', async () => {
      await expect(ipfs.files.mkdir('/', {
        parents: false
      })).to.eventually.be.rejected()
    })

    it('refuses to create a nested directory when -p is false', async () => {
      await expect(ipfs.files.mkdir('/foo/bar/baz', {
        parents: false
      })).to.eventually.be.rejected()
    })

    it('creates a directory', async () => {
      const path = '/foo'

      await ipfs.files.mkdir(path, {})

      const stats = await ipfs.files.stat(path)
      expect(stats.type).to.equal('directory')

      const files = await all(ipfs.files.ls(path))

      expect(files.length).to.equal(0)
    })

    it('refuses to create a directory that already exists', async () => {
      const path = '/qux/quux/quuux'

      await ipfs.files.mkdir(path, {
        parents: true
      })

      await expect(ipfs.files.mkdir(path, {
        parents: false
      })).to.eventually.be.rejected()
    })

    it('does not error when creating a directory that already exists and parents is true', async () => {
      const path = '/qux/quux/quuux'

      await ipfs.files.mkdir(path, {
        parents: true
      })

      await ipfs.files.mkdir(path, {
        parents: true
      })
    })

    it('creates a nested directory when -p is true', async () => {
      const path = '/foo/bar/baz'

      await ipfs.files.mkdir(path, {
        parents: true
      })

      const files = await all(ipfs.files.ls(path))

      expect(files.length).to.equal(0)
    })

    it('creates nested directories', async () => {
      await ipfs.files.mkdir('/nested-dir')
      await ipfs.files.mkdir('/nested-dir/baz')

      const files = await all(ipfs.files.ls('/nested-dir'))

      expect(files.length).to.equal(1)
    })

    it('creates a nested directory with a different CID version to the parent', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const subDirectory = `cid-versions-${Math.random()}`
      const subDirectoryPath = `${directoryPath}/${subDirectory}`

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.mkdir(subDirectoryPath, {
        cidVersion: 1
      })

      await expect(ipfs.files.stat(subDirectoryPath)).to.eventually.have.nested.property('cid.version', 1)
    })

    it('creates a nested directory with a different hash function to the parent', async () => {
      const directory = `cid-versions-${Math.random()}`
      const directoryPath = `/${directory}`
      const subDirectory = `cid-versions-${Math.random()}`
      const subDirectoryPath = `${directoryPath}/${subDirectory}`

      await ipfs.files.mkdir(directoryPath, {
        cidVersion: 0
      })

      await expect(ipfs.files.stat(directoryPath)).to.eventually.have.nested.property('cid.version', 0)

      await ipfs.files.mkdir(subDirectoryPath, {
        cidVersion: 1,
        hashAlg: 'sha2-512'
      })

      await expect(ipfs.files.stat(subDirectoryPath)).to.eventually.have.nested.property('cid.multihash.code', sha512.code)
    })

    it('should make directory and have default mode', async function () {
      await testMode(undefined, parseInt('0755', 8))
    })

    it('should make directory and specify mode as string', async function () {
      const mode = '0321'
      await testMode(mode, parseInt(mode, 8))
    })

    it('should make directory and specify mode as number', async function () {
      const mode = parseInt('0321', 8)
      await testMode(mode, mode)
    })

    it('should make directory and specify mtime as Date', async function () {
      const mtime = new Date(5000)
      await testMtime(mtime, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should make directory and specify mtime as { nsecs, secs }', async function () {
      const mtime = {
        secs: 5,
        nsecs: 0
      }
      await testMtime(mtime, mtime)
    })

    it('should make directory and specify mtime as timespec', async function () {
      await testMtime({
        Seconds: 5,
        FractionalNanoseconds: 0
      }, {
        secs: 5,
        nsecs: 0
      })
    })

    it('should make directory and specify mtime as hrtime', async function () {
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

      it('makes a directory inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const dirPath = `${shardedDirPath}/subdir-${Math.random()}`

        await ipfs.files.mkdir(`${dirPath}`)

        await expect(isShardAtPath(shardedDirPath, ipfs)).to.eventually.be.true()
        await expect(ipfs.files.stat(shardedDirPath)).to.eventually.have.property('type', 'directory')

        await expect(isShardAtPath(dirPath, ipfs)).to.eventually.be.false()
        await expect(ipfs.files.stat(dirPath)).to.eventually.have.property('type', 'directory')
      })
    })
  })
}
