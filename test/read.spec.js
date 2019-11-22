/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const createMfs = require('./helpers/create-mfs')
const createShardedDirectory = require('./helpers/create-sharded-directory')
const crypto = require('crypto')
const streamToBuffer = require('./helpers/stream-to-buffer')

describe('read', () => {
  let mfs
  const smallFile = crypto.randomBytes(13)

  before(async () => {
    mfs = await createMfs()
  })

  describe('read', () => {
    it('reads a small file', async () => {
      const filePath = '/small-file.txt'

      await mfs.write(filePath, smallFile, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(filePath))

      expect(buffer).to.deep.equal(smallFile)
    })

    it('reads a file with an offset', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = crypto.randomBytes(100)
      const offset = 10

      await mfs.write(path, data, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(path, {
        offset
      }))

      expect(buffer).to.deep.equal(data.slice(offset))
    })

    it('reads a file with a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = crypto.randomBytes(100)
      const length = 10

      await mfs.write(path, data, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(path, {
        length
      }))

      expect(buffer).to.deep.equal(data.slice(0, length))
    })

    it('reads a file with a legacy count argument', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = crypto.randomBytes(100)
      const length = 10

      await mfs.write(path, data, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(path, {
        count: length
      }))

      expect(buffer).to.deep.equal(data.slice(0, length))
    })

    it('reads a file with an offset and a length', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = crypto.randomBytes(100)
      const offset = 10
      const length = 10

      await mfs.write(path, data, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(path, {
        offset,
        length
      }))

      expect(buffer).to.deep.equal(data.slice(offset, offset + length))
    })

    it('reads a file with an offset and a legacy count argument', async () => {
      const path = `/some-file-${Math.random()}.txt`
      const data = crypto.randomBytes(100)
      const offset = 10
      const length = 10

      await mfs.write(path, data, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(path, {
        offset,
        count: length
      }))

      expect(buffer).to.deep.equal(data.slice(offset, offset + length))
    })

    it('refuses to read a directory', async () => {
      const path = '/'

      try {
        await streamToBuffer(mfs.read(path))
        throw new Error('Should have errored on trying to read a directory')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FILE')
      }
    })

    it('refuses to read a non-existent file', async () => {
      try {
        await streamToBuffer(mfs.read(`/file-${Math.random()}.txt`))
        throw new Error('Should have errored on non-existent file')
      } catch (err) {
        expect(err.code).to.equal('ERR_NOT_FOUND')
      }
    })

    it('reads file from inside a sharded directory', async () => {
      const shardedDirPath = await createShardedDirectory(mfs)
      const filePath = `${shardedDirPath}/file-${Math.random()}.txt`
      const content = Buffer.from([0, 1, 2, 3, 4])

      await mfs.write(filePath, content, {
        create: true
      })

      const buffer = await streamToBuffer(mfs.read(filePath))

      expect(buffer).to.deep.equal(content)
    })
  })
})
