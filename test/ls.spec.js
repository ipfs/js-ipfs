/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const randomBytes = require('./helpers/random-bytes')
const CID = require('cids')
const {
  FILE_TYPES
} = require('../src')

const {
  createMfs,
  createShardedDirectory
} = require('./helpers')

describe('ls', () => {
  let mfs
  let largeFile = randomBytes(490668)

  before(async () => {
    mfs = await createMfs()
  })

  const methods = [{
    name: 'ls',
    ls: function () {
      return mfs.ls.apply(mfs, arguments)
    },
    collect: (entries) => entries
  }, {
    name: 'lsPullStream',
    ls: function () {
      return Promise.resolve(mfs.lsPullStream.apply(mfs, arguments))
    },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        pull(
          stream,
          collect((error, entries) => {
            if (error) {
              return reject(error)
            }

            resolve(entries)
          })
        )
      })
    }
  }, {
    name: 'lsReadableStream',
    ls: function () {
      return Promise.resolve(mfs.lsReadableStream.apply(mfs, arguments))
    },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        let entries = []

        stream.on('data', (entry) => {
          entries.push(entry)
        })

        stream.on('end', (entry) => {
          if (entry) {
            entries.push(entry)
          }

          resolve(entries)
        })

        stream.on('error', (error) => {
          reject(error)
        })
      })
    }
  }]

  methods.forEach(method => {
    describe(`ls ${method.name}`, () => {
      it('lists the root directory by default', async () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${fileName}`, content, {
          create: true
        })
        const result = await method.ls()
        const files = await method.collect(result)

        expect(files.find(file => file.name === fileName)).to.be.ok()
      })

      it('refuses to lists files with an empty path', async () => {
        try {
          await method.collect(await method.ls(''))
          throw new Error('No error was thrown for an empty path')
        } catch (err) {
          expect(err.message).to.contain('paths must not be empty')
        }
      })

      it('refuses to lists files with an invalid path', async () => {
        try {
          await method.collect(await method.ls('not-valid'))
          throw new Error('No error was thrown for an empty path')
        } catch (err) {
          expect(err.message).to.contain('paths must start with a leading /')
        }
      })

      it('lists files in a directory', async () => {
        const dirName = `dir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${dirName}/${fileName}`, content, {
          create: true,
          parents: true
        })

        const stream = await method.ls(`/${dirName}`, {})
        const files = await method.collect(stream)

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal(FILE_TYPES.file)
        expect(files[0].size).to.equal(0)
        expect(files[0].hash).to.equal('')
      })

      it('lists files in a directory with meta data', async () => {
        const dirName = `dir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${dirName}/${fileName}`, content, {
          create: true,
          parents: true
        })

        const stream = await method.ls(`/${dirName}`, {
          long: true
        })
        const files = await method.collect(stream)

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal(FILE_TYPES.file)
        expect(files[0].size).to.equal(content.length)
      })

      it('lists a file', async () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${fileName}`, content, {
          create: true
        })

        const stream = await method.ls(`/${fileName}`)
        const files = await method.collect(stream)

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal(FILE_TYPES.file)
        expect(files[0].size).to.equal(0)
        expect(files[0].hash).to.equal('')
      })

      it('lists a file with meta data', async () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${fileName}`, content, {
          create: true
        })
        const stream = await method.ls(`/${fileName}`, {
          long: true
        })
        const files = await method.collect(stream)

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal(FILE_TYPES.file)
        expect(files[0].size).to.equal(content.length)
      })

      it('lists a file with a base32 hash', async () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')

        await mfs.write(`/${fileName}`, content, {
          create: true
        })

        const stream = await method.ls(`/${fileName}`, {
          long: true,
          cidBase: 'base32'
        })
        const files = await method.collect(stream)

        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal(FILE_TYPES.file)
        expect(files[0].size).to.equal(content.length)
        expect(files[0].hash.startsWith('b')).to.equal(true)
      })

      it('fails to list non-existent file', async () => {
        try {
          const stream = await method.ls('/i-do-not-exist')
          await method.collect(stream)
          throw new Error('No error was thrown for a non-existent file')
        } catch (err) {
          expect(err.message).to.contain('does not exist')
        }
      })

      it('lists a raw node', async () => {
        const filePath = '/stat/large-file.txt'

        await mfs.write(filePath, largeFile, {
          create: true,
          parents: true,
          rawLeaves: true
        })

        const stats = await mfs.stat(filePath)
        const result = await mfs.ipld.get(new CID(stats.hash))
        const node = result.value
        const child = node.links[0]

        expect(child.cid.codec).to.equal('raw')

        const rawNodeContents = await mfs.ls(`/ipfs/${child.cid}/`, {
          long: true
        })

        expect(rawNodeContents[0].type).to.equal(0) // this is what go does
        expect(rawNodeContents[0].hash).to.equal(child.cid.toBaseEncodedString())
      })

      it('lists a raw node in an mfs directory', async () => {
        const filePath = '/stat/large-file.txt'

        await mfs.write(filePath, largeFile, {
          create: true,
          parents: true,
          rawLeaves: true
        })

        const stats = await mfs.stat(filePath)
        const cid = new CID(stats.hash)
        const result = await mfs.ipld.get(cid)
        const node = result.value
        const child = node.links[0]

        expect(child.cid.codec).to.equal('raw')

        const dir = `/dir-with-raw-${Date.now()}`
        const path = `${dir}/raw-${Date.now()}`

        await mfs.mkdir(dir)
        await mfs.cp(`/ipfs/${child.cid.toBaseEncodedString()}`, path)

        const rawNodeContents = await mfs.ls(path, {
          long: true
        })

        expect(rawNodeContents[0].type).to.equal(0) // this is what go does
        expect(rawNodeContents[0].hash).to.equal(child.cid.toBaseEncodedString())
      })

      it('lists a sharded directory contents', async () => {
        const shardSplitThreshold = 10
        const fileCount = 11
        const dirPath = await createShardedDirectory(mfs, shardSplitThreshold, fileCount)

        const files = await method.collect(await method.ls(dirPath, {
          long: true
        }))

        expect(files.length).to.equal(fileCount)

        files.forEach(file => {
          // should be a file
          expect(file.type).to.equal(0)
        })
      })

      it('lists a file inside a sharded directory directly', async () => {
        const dirPath = await createShardedDirectory(mfs)

        const files = await method.collect(await method.ls(dirPath, {
          long: true
        }))

        const filePath = `${dirPath}/${files[0].name}`

        // should be able to ls new file directly
        expect(await method.collect(await method.ls(filePath, {
          long: true
        }))).to.not.be.empty()
      })

      it('lists the contents of a directory inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(mfs)
        const dirPath = `${shardedDirPath}/subdir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`

        await mfs.mkdir(`${dirPath}`)
        await mfs.write(`${dirPath}/${fileName}`, Buffer.from([0, 1, 2, 3]), {
          create: true
        })

        const files = await method.collect(await method.ls(dirPath, {
          long: true
        }))

        expect(files.length).to.equal(1)
        expect(files.filter(file => file.name === fileName)).to.be.ok()
      })
    })
  })
})
