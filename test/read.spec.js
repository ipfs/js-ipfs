/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')
const bufferStream = require('./fixtures/buffer-stream')

const {
  createMfs
} = require('./fixtures')

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

  it('reads a small file', () => {
    const filePath = '/small-file.txt'

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => mfs.read(filePath))
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
      .then(() => mfs.read(path, {
        offset
      }))
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
      .then(() => mfs.read(path, {
        length
      }))
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
      .then(() => mfs.read(path, {
        offset,
        length
      }))
      .then((buffer) => expect(buffer).to.deep.equal(data.slice(offset, offset + length)))
  })
})
