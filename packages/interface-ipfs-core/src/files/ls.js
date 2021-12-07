/* eslint-env mocha */

import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { expect } from 'aegir/utils/chai.js'
import { getDescribe, getIt } from '../utils/mocha.js'
import { CID } from 'multiformats/cid'
import { createShardedDirectory } from '../utils/create-sharded-directory.js'
import all from 'it-all'
import { randomBytes } from 'iso-random-stream'
import * as raw from 'multiformats/codecs/raw'

/**
 * @typedef {import('ipfsd-ctl').Factory} Factory
 */

/**
 * @param {Factory} factory
 * @param {Object} options
 */
export function testLs (factory, options) {
  const describe = getDescribe(options)
  const it = getIt(options)
  const largeFile = randomBytes(490668)

  describe('.files.ls', function () {
    this.timeout(120 * 1000)

    /** @type {import('ipfs-core-types').IPFS} */
    let ipfs

    before(async () => { ipfs = (await factory.spawn()).api })

    after(() => factory.clean())

    it('should require a path', () => {
      // @ts-expect-error invalid args
      expect(all(ipfs.files.ls())).to.eventually.be.rejected()
    })

    it('lists the root directory', async () => {
      const fileName = `small-file-${Math.random()}.txt`
      const content = uint8ArrayFromString('Hello world')

      await ipfs.files.write(`/${fileName}`, content, {
        create: true
      })

      const files = await all(ipfs.files.ls('/'))

      expect(files).to.have.lengthOf(1).and.to.containSubset([{
        cid: CID.parse('Qmetpc7cZmN25Wcc6R27cGCAvCDqCS5GjHG4v7xABEfpmJ'),
        name: fileName,
        size: content.length,
        type: 'file'
      }])
    })

    it('refuses to lists files with an empty path', async () => {
      await expect(all(ipfs.files.ls(''))).to.eventually.be.rejected()
    })

    it('refuses to lists files with an invalid path', async () => {
      await expect(all(ipfs.files.ls('not-valid'))).to.eventually.be.rejected()
    })

    it('lists files in a directory', async () => {
      const dirName = `dir-${Math.random()}`
      const fileName = `small-file-${Math.random()}.txt`
      const content = uint8ArrayFromString('Hello world')

      await ipfs.files.write(`/${dirName}/${fileName}`, content, {
        create: true,
        parents: true
      })

      const files = await all(ipfs.files.ls(`/${dirName}`))

      expect(files).to.have.lengthOf(1).and.to.containSubset([{
        cid: CID.parse('Qmetpc7cZmN25Wcc6R27cGCAvCDqCS5GjHG4v7xABEfpmJ'),
        name: fileName,
        size: content.length,
        type: 'file'
      }])
    })

    it('lists a file', async () => {
      const fileName = `small-file-${Math.random()}.txt`
      const content = uint8ArrayFromString('Hello world')

      await ipfs.files.write(`/${fileName}`, content, {
        create: true
      })

      const files = await all(ipfs.files.ls(`/${fileName}`))

      expect(files).to.have.lengthOf(1).and.to.containSubset([{
        cid: CID.parse('Qmetpc7cZmN25Wcc6R27cGCAvCDqCS5GjHG4v7xABEfpmJ'),
        name: fileName,
        size: content.length,
        type: 'file'
      }])
    })

    it('fails to list non-existent file', async () => {
      await expect(all(ipfs.files.ls('/i-do-not-exist'))).to.eventually.be.rejected()
    })

    it('lists a raw node', async () => {
      const filePath = '/stat/large-file.txt'

      await ipfs.files.write(filePath, largeFile, {
        create: true,
        parents: true,
        rawLeaves: true
      })

      const stats = await ipfs.files.stat(filePath)
      const { value: node } = await ipfs.dag.get(stats.cid)

      expect(node).to.have.nested.property('Links[0].Hash.code', raw.code)

      const child = node.Links[0]
      const files = await all(ipfs.files.ls(`/ipfs/${child.Hash}`))

      expect(files).to.have.lengthOf(1).and.to.containSubset([{
        cid: child.Hash,
        name: child.Hash.toString(),
        size: 262144,
        type: 'file'
      }])
    })

    it('lists a raw node in an mfs directory', async () => {
      const filePath = '/stat/large-file.txt'

      await ipfs.files.write(filePath, largeFile, {
        create: true,
        parents: true,
        rawLeaves: true
      })

      const stats = await ipfs.files.stat(filePath)
      const cid = stats.cid
      const { value: node } = await ipfs.dag.get(cid)

      expect(node).to.have.nested.property('Links[0].Hash.code', raw.code)

      const child = node.Links[0]
      const dir = `/dir-with-raw-${Math.random()}`
      const path = `${dir}/raw-${Math.random()}`

      await ipfs.files.mkdir(dir)
      await ipfs.files.cp(`/ipfs/${child.Hash}`, path)

      const files = await all(ipfs.files.ls(`/ipfs/${child.Hash}`))

      expect(files).to.have.lengthOf(1).and.to.containSubset([{
        cid: child.Hash,
        name: child.Hash.toString(),
        size: 262144,
        type: 'file'
      }])
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

      it('lists a sharded directory contents', async () => {
        const fileCount = 1001
        const dirPath = await createShardedDirectory(ipfs, fileCount)
        const files = await all(ipfs.files.ls(dirPath))

        expect(files.length).to.equal(fileCount)

        files.forEach(file => {
          // should be a file
          expect(file.type).to.equal('file')
        })
      })

      it('lists a file inside a sharded directory directly', async () => {
        const dirPath = await createShardedDirectory(ipfs)
        const files = await all(ipfs.files.ls(dirPath))
        const filePath = `${dirPath}/${files[0].name}`

        // should be able to ls new file directly
        const file = await all(ipfs.files.ls(filePath))

        expect(file).to.have.lengthOf(1).and.to.containSubset([files[0]])
      })

      it('lists the contents of a directory inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(ipfs)
        const dirPath = `${shardedDirPath}/subdir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`

        await ipfs.files.mkdir(`${dirPath}`)
        await ipfs.files.write(`${dirPath}/${fileName}`, Uint8Array.from([0, 1, 2, 3]), {
          create: true
        })

        const files = await all(ipfs.files.ls(dirPath))

        expect(files.length).to.equal(1)
        expect(files.filter(file => file.name === fileName)).to.be.ok()
      })
    })
  })
}
