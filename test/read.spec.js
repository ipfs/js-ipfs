/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const bufferStream = require('pull-buffer-stream')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const {
  createMfs,
  createShardedDirectory
} = require('./helpers')
const randomBytes = require('./helpers/random-bytes')

describe('read', () => {
  let mfs
  let smallFile = randomBytes(13)

  before(async () => {
    mfs = await createMfs()
  })

  const methods = [{
    name: 'read',
    read: function () {
      return mfs.read.apply(mfs, arguments)
    },
    collect: (buffer) => buffer
  }, {
    name: 'readPullStream',
    read: function () {
      return Promise.resolve(mfs.readPullStream.apply(mfs, arguments))
    },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        pull(
          stream,
          collect((err, buffers) => {
            if (err) {
              return reject(err)
            }

            resolve(Buffer.concat(buffers))
          })
        )
      })
    }
  }, {
    name: 'readReadableStream',
    read: function () {
      return Promise.resolve(mfs.readReadableStream.apply(mfs, arguments))
    },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0)

        stream.on('data', (buffer) => {
          data = Buffer.concat([data, buffer])
        })

        stream.on('end', () => {
          resolve(data)
        })

        stream.on('error', (err) => {
          reject(err)
        })
      })
    }
  }]

  methods.forEach(method => {
    describe(`read ${method.name}`, () => {
      it('reads a small file', async () => {
        const filePath = '/small-file.txt'

        await mfs.write(filePath, smallFile, {
          create: true
        })

        const result = await method.read(filePath)
        const buffer = await method.collect(result)
        expect(buffer).to.deep.equal(smallFile)
      })

      it('reads a file with an offset', async () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const offset = 10

        await mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })

        const result = await method.read(path, {
          offset
        })
        const buffer = await method.collect(result)

        expect(buffer).to.deep.equal(data.slice(offset))
      })

      it('reads a file with a length', async () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const length = 10

        await mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })

        const result = await method.read(path, {
          length
        })
        const buffer = await method.collect(result)

        expect(buffer).to.deep.equal(data.slice(0, length))
      })

      it('reads a file with a legacy count argument', async () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const length = 10

        await mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })

        const result = await method.read(path, {
          count: length
        })
        const buffer = await method.collect(result)

        expect(buffer).to.deep.equal(data.slice(0, length))
      })

      it('reads a file with an offset and a length', async () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const offset = 10
        const length = 10

        await mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })

        const result = await method.read(path, {
          offset,
          length
        })
        const buffer = await method.collect(result)

        expect(buffer).to.deep.equal(data.slice(offset, offset + length))
      })

      it('reads a file with an offset and a legacy count argument', async () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const offset = 10
        const length = 10

        await mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })

        const result = await method.read(path, {
          offset,
          count: length
        })

        const buffer = await method.collect(result)

        expect(buffer).to.deep.equal(data.slice(offset, offset + length))
      })

      it('refuses to read a directory', async () => {
        const path = '/'

        try {
          const result = await method.read(path)
          await method.collect(result)
          throw new Error('Should have errored on trying to read a directory')
        } catch (err) {
          expect(err.message).to.contain('was not a file')
        }
      })

      it('refuses to read a non-existent file', async () => {
        try {
          const stream = await method.read(`/file-${Math.random()}.txt`)
          await method.collect(stream)
          throw new Error('Should have errored on non-existent file')
        } catch (err) {
          expect(err.message).to.contain('does not exist')
        }
      })

      it('reads file from inside a sharded directory', async () => {
        const shardedDirPath = await createShardedDirectory(mfs)
        const filePath = `${shardedDirPath}/file-${Math.random()}.txt`
        const content = Buffer.from([0, 1, 2, 3, 4])

        await mfs.write(filePath, content, {
          create: true
        })

        const stream = await method.read(filePath)

        expect(await method.collect(stream)).to.deep.equal(content)
      })
    })
  })
})
