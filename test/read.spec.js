/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')
const bufferStream = require('pull-buffer-stream')
const pull = require('pull-stream/pull')
const collect = require('pull-stream/sinks/collect')
const {
  createMfs
} = require('./helpers')

describe('read', function () {
  this.timeout(30000)

  let mfs
  let smallFile = loadFixture(path.join('test', 'fixtures', 'small-file.txt'))

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  const methods = [{
    name: 'read',
    read: function () { return mfs.read.apply(mfs, arguments) },
    collect: (buffer) => buffer
  }, {
    name: 'readPullStream',
    read: function () { return mfs.readPullStream.apply(mfs, arguments) },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        pull(
          stream,
          collect((error, buffers) => {
            if (error) {
              return reject(error)
            }

            resolve(Buffer.concat(buffers))
          })
        )
      })
    }
  }, {
    name: 'readReadableStream',
    read: function () { return mfs.readReadableStream.apply(mfs, arguments) },
    collect: (stream) => {
      return new Promise((resolve, reject) => {
        let data = Buffer.alloc(0)

        stream.on('data', (buffer) => {
          data = Buffer.concat([data, buffer])
        })

        stream.on('end', () => {
          resolve(data)
        })

        stream.on('error', (error) => reject(error))
      })
    }
  }]

  methods.forEach(method => {
    describe(`read ${method.name}`, function () {
      it('reads a small file', () => {
        const filePath = '/small-file.txt'

        return mfs.write(filePath, smallFile, {
          create: true
        })
          .then(() => method.read(filePath))
          .then((result) => method.collect(result))
          .then((buffer) => {
            expect(buffer).to.deep.equal(smallFile)
          })
      })

      it('reads a file with an offset', () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const offset = 10

        return mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })
          .then(() => method.read(path, {
            offset
          }))
          .then((result) => method.collect(result))
          .then((buffer) => expect(buffer).to.deep.equal(data.slice(offset)))
      })

      it('reads a file with a length', () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const length = 10

        return mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })
          .then(() => method.read(path, {
            length
          }))
          .then((result) => method.collect(result))
          .then((buffer) => expect(buffer).to.deep.equal(data.slice(0, length)))
      })

      it('reads a file with an offset and a length', () => {
        const path = `/some-file-${Math.random()}.txt`
        let data = Buffer.alloc(0)
        const offset = 10
        const length = 10

        return mfs.write(path, bufferStream(100, {
          collector: (bytes) => {
            data = Buffer.concat([data, bytes])
          }
        }), {
          create: true
        })
          .then(() => method.read(path, {
            offset,
            length
          }))
          .then((result) => method.collect(result))
          .then((buffer) => expect(buffer).to.deep.equal(data.slice(offset, offset + length)))
      })

      it('refuses to read a directory', () => {
        const path = '/'

        return method.read(path)
          .catch(error => {
            expect(error.message).to.contain('was not a file')
          })
      })
    })
  })
})
