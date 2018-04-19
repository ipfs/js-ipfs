/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')

const {
  createMfs
} = require('./fixtures')

describe('write', function () {
  this.timeout(30000)

  let mfs
  let smallFile = loadFixture(path.join('test', 'fixtures', 'small-file.txt'))
  let largeFile = loadFixture(path.join('test', 'fixtures', 'large-file.jpg'))

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  it('writes a small file', () => {
    const filePath = '/small-file.txt'

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a deeply nested small file', () => {
    const filePath = '/foo/bar/baz/qux/quux/garply/small-file.txt'

    return mfs.write(filePath, smallFile, {
      create: true,
      parents: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('limits how many bytes to write to a file', () => {
    const filePath = `/${Math.random()}/small-file.txt`

    return mfs.write(filePath, smallFile, {
      create: true,
      parents: true,
      length: 2
    })
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        expect(buffer).to.deep.equal(smallFile.slice(0, 2))
      })
  })

  it('refuses to write to a file in a folder that does not exist', () => {
    const filePath = `/${Math.random()}/small-file.txt`

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => {
        throw new Error('Writing a file to a non-existent folder without the --parents flag should have failed')
      })
      .catch((error) => {
        expect(error.message).to.contain('did not exist')
      })
  })

  it('refuses to write to a file that does not exist', () => {
    const filePath = `/small-file-${Math.random()}.txt`

    return mfs.write(filePath, smallFile)
      .then(() => {
        throw new Error('Writing a file to a non-existent file without the --create flag should have failed')
      })
      .catch((error) => {
        expect(error.message).to.contain('file does not exist')
      })
  })

  it('overwrites part of a small file without truncating', () => {
    const filePath = `/small-file-${Math.random()}.txt`
    const newContent = Buffer.from('Goodbye world')

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => mfs.write(filePath, newContent))
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        expect(buffer).to.deep.equal(newContent)
      })
  })

  it('overwrites part of a large file without truncating', () => {
    const filePath = `/large-file-${Math.random()}.jpg`
    const newContent = Buffer.from([0, 1, 2, 3])
    const offset = 490000

    return mfs.write(filePath, largeFile, {
      create: true
    })
      .then(() => mfs.write(filePath, newContent, {
        offset
      }))
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        const expected = Buffer.from(largeFile)
        newContent.copy(expected, offset)

        expect(buffer).to.deep.equal(expected)
      })
  })

  it.skip('overwrites part of a really large file without truncating', () => {
    const filePath = `/really-large-file-${Math.random()}.jpg`
    const buffers = []

    for (let i = 0; i < 100; i++) {
      buffers.push(largeFile)
    }

    const originalContent = Buffer.concat(buffers)
    const newContent = Buffer.from([0, 1, 2, 3])
    const offset = 490000

    return mfs.write(filePath, originalContent, {
      create: true
    })
      .then(() => mfs.write(filePath, newContent, {
        offset
      }))
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        const expected = Buffer.from(originalContent)
        newContent.copy(expected, offset)

        expect(buffer).to.deep.equal(expected)
      })
  })

  it('pads the start of a new file when an offset is specified', () => {
    const filePath = `/small-file-${Math.random()}.txt`

    return mfs.write(filePath, smallFile, {
      offset: 10,
      create: true
    })
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        expect(buffer).to.deep.equal(Buffer.concat([Buffer.alloc(10, 0), smallFile]))
      })
  })

  it.skip('truncates a file before writing', () => {

  })

  it.skip('writes a file with raw blocks for newly created leaf nodes', () => {

  })

  it.skip('writes a file with a different CID version to the parent', () => {

  })

  it.skip('writes a file with a different hash function to the parent', () => {

  })
})
