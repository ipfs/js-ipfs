/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const concat = require('it-concat')
const all = require('it-all')
const { fixtures } = require('../utils')
const { getDescribe, getIt, expect } = require('../utils/mocha')
const createShardedDirectory = require('../utils/create-sharded-directory')
const randomBytes = require('iso-random-stream/src/random')

/** @typedef { import("ipfsd-ctl/src/factory") } Factory */
/**
 * @param {Factory} common
 * @param {Object} options
 */
module.exports = (common, options) => {
  const describe = getDescribe(options)
  const it = getIt(options)
  const smallFile = randomBytes(13)

  describe('.files.read', function () {
    this.timeout(40 * 1000)

    let ipfs

    before(async () => { ipfs = (await common.spawn()).api })

    after(() => common.clean())

    it('reads a small file', async () => {
      const filePath = '/small-file.txt'

      await ipfs.files.write(filePath, smallFile, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(filePath))

      expect(buffer.slice()).to.deep.equal(smallFile)
    })

    it('reads a file with an offset', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const offset = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(path, {
        offset
      }))

      expect(buffer.slice()).to.deep.equal(data.slice(offset))
    })

    it('reads a file with a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(path, {
        length
      }))

      expect(buffer.slice()).to.deep.equal(data.slice(0, length))
    })

    it('reads a file with a legacy count argument', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(path, {
        count: length
      }))

      expect(buffer.slice()).to.deep.equal(data.slice(0, length))
    })

    it('reads a file with an offset and a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const offset = 10
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(path, {
        offset,
        length
      }))

      expect(buffer.slice()).to.deep.equal(data.slice(offset, offset + length))
    })

    it('reads a file with an offset and a legacy count argument', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = randomBytes(100)
      const offset = 10
      const length = 10

      await ipfs.files.write(path, data, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(path, {
        offset,
        count: length
      }))

      expect(buffer.slice()).to.deep.equal(data.slice(offset, offset + length))
    })

    it('refuses to read a directory', async () => {
      const path = '/'

      await expect(concat(ipfs.files.read(path))).to.eventually.be.rejectedWith(/not a file/)
    })

    it('refuses to read a non-existent file', async () => {
      const path = `/file-${Math.random()}.txt`

      await expect(concat(ipfs.files.read(path))).to.eventually.be.rejectedWith(/does not exist/)
    })

    it('reads file from inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(ipfs)
      const filePath = `${shardedDirPath}/file-${Math.random()}.txt`
      const content = Buffer.from([0, 1, 2, 3, 4])

      await ipfs.files.write(filePath, content, {
        create: true
      })

      const buffer = await concat(ipfs.files.read(filePath))

      expect(buffer.slice()).to.deep.equal(content)
    })

    it('should read from outside of mfs', async () => {
      const [{ cid }] = await all(ipfs.add(fixtures.smallFile.data))
      const testFileData = await concat(ipfs.files.read(`/ipfs/${cid}`))
      expect(testFileData.slice()).to.eql(fixtures.smallFile.data)
    })
  })
}
