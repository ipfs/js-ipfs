/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const {
  FILE_TYPES
} = require('../src')

const {
  createMfs,
  createShardedDirectory
} = require('./helpers')

describe('ls', function () {
  let mfs

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
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
    describe(`ls ${method.name}`, function () {
      it('lists the root directory by default', () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${fileName}`, content, {
          create: true
        })
          .then(() => method.ls())
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.find(file => file.name === fileName)).to.be.ok()
          })
      })
    
      it('refuses to lists files with an empty path', () => {
        return method.ls('')
          .then((result) => method.collect(result))
          .then(() => {
            throw new Error('No error was thrown for an empty path')
          })
          .catch(error => {
            expect(error.message).to.contain('paths must not be empty')
          })
      })
    
      it('refuses to lists files with an invalid path', () => {
        return method.ls('not-valid')
          .then((result) => method.collect(result))
          .then(() => {
            throw new Error('No error was thrown for an empty path')
          })
          .catch(error => {
            expect(error.message).to.contain('paths must start with a leading /')
          })
      })
    
      it('lists files in a directory', () => {
        const dirName = `dir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${dirName}/${fileName}`, content, {
          create: true,
          parents: true
        })
          .then(() => method.ls(`/${dirName}`, {}))
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.length).to.equal(1)
            expect(files[0].name).to.equal(fileName)
            expect(files[0].type).to.equal(FILE_TYPES.file)
            expect(files[0].size).to.equal(0)
            expect(files[0].hash).to.equal('')
          })
      })
    
      it('lists files in a directory with meta data', () => {
        const dirName = `dir-${Math.random()}`
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${dirName}/${fileName}`, content, {
          create: true,
          parents: true
        })
          .then(() => method.ls(`/${dirName}`, {
            long: true
          }))
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.length).to.equal(1)
            expect(files[0].name).to.equal(fileName)
            expect(files[0].type).to.equal(FILE_TYPES.file)
            expect(files[0].size).to.equal(content.length)
          })
      })
    
      it('lists a file', () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${fileName}`, content, {
          create: true
        })
          .then(() => method.ls(`/${fileName}`))
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.length).to.equal(1)
            expect(files[0].name).to.equal(fileName)
            expect(files[0].type).to.equal(FILE_TYPES.file)
            expect(files[0].size).to.equal(0)
            expect(files[0].hash).to.equal('')
          })
      })
    
      it('lists a file with meta data', () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${fileName}`, content, {
          create: true
        })
          .then(() => method.ls(`/${fileName}`, {
            long: true
          }))
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.length).to.equal(1)
            expect(files[0].name).to.equal(fileName)
            expect(files[0].type).to.equal(FILE_TYPES.file)
            expect(files[0].size).to.equal(content.length)
          })
      })
    
      it('lists a file with a base32 hash', () => {
        const fileName = `small-file-${Math.random()}.txt`
        const content = Buffer.from('Hello world')
    
        return mfs.write(`/${fileName}`, content, {
          create: true
        })
          .then(() => method.ls(`/${fileName}`, {
            long: true,
            cidBase: 'base32'
          }))
          .then((result) => method.collect(result))
          .then(files => {
            expect(files.length).to.equal(1)
            expect(files[0].name).to.equal(fileName)
            expect(files[0].type).to.equal(FILE_TYPES.file)
            expect(files[0].size).to.equal(content.length)
            expect(files[0].hash.startsWith('b')).to.equal(true)
          })
      })
    
      it('fails to list non-existent file', () => {
        return method.ls('/i-do-not-exist')
          .then((result) => method.collect(result))
          .then(() => {
            throw new Error('No error was thrown for a non-existent file')
          })
          .catch(error => {
            expect(error.message).to.contain('does not exist')
          })
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
    
        const files =  await method.collect(await method.ls(dirPath, {
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
