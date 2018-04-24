/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')
const isNode = require('detect-node')
const values = require('pull-stream/sources/values')

let fs

if (isNode) {
  fs = require('fs')
}

const {
  createMfs
} = require('./fixtures')

describe('write', function () {
  this.timeout(30000)

  let mfs
  let smallFile = loadFixture(path.join('test', 'fixtures', 'small-file.txt'))
  let largeFile = loadFixture(path.join('test', 'fixtures', 'large-file.jpg'))

  const runTest = (fn) => {
    let i = 0
    const iterations = 5
    const files = [{
      type: 'Small file',
      path: `/small-file-${Math.random()}.txt`,
      content: smallFile,
      contentSize: smallFile.length
    }, {
      type: 'Large file',
      path: `/large-file-${Math.random()}.jpg`,
      content: largeFile,
      contentSize: largeFile.length
    }, {
      type: 'Really large file',
      path: `/really-large-file-${Math.random()}.jpg`,
      content: (end, callback) => {
        if (end) {
          return callback(end)
        }

        if (i === iterations) {
          // Ugh. https://github.com/standard/standard/issues/623
          const foo = true
          return callback(foo)
        }

        i++
        callback(null, largeFile)
      },
      contentSize: largeFile.length * iterations
    }]

    files.forEach((file) => {
      fn(file)
    })
  }

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  it('writes a small file using a buffer', () => {
    const filePath = `/small-file-${Math.random()}.txt`

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a small file using a path (Node only)', function () {
    if (!isNode) {
      return this.skip()
    }

    const filePath = `/small-file-${Math.random()}.txt`
    const pathToFile = path.resolve(path.join(__dirname, 'fixtures', 'small-file.txt'))

    return mfs.write(filePath, pathToFile, {
      create: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a small file using a Node stream (Node only)', function () {
    if (!isNode) {
      return this.skip()
    }

    const filePath = `/small-file-${Math.random()}.txt`
    const pathToFile = path.resolve(path.join(__dirname, 'fixtures', 'small-file.txt'))
    const stream = fs.createReadStream(pathToFile)

    return mfs.write(filePath, stream, {
      create: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a small file using a pull stream source', function () {
    const filePath = `/small-file-${Math.random()}.txt`

    return mfs.write(filePath, values([smallFile]), {
      create: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a small file using an HTML5 Blob (Browser only)', function () {
    if (!global.Blob) {
      return this.skip()
    }

    const filePath = `/small-file-${Math.random()}.txt`
    const blob = new global.Blob([smallFile.buffer.slice(smallFile.byteOffset, smallFile.byteOffset + smallFile.byteLength)])

    return mfs.write(filePath, blob, {
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

  runTest(({type, path, content}) => {
    it(`limits how many bytes to write to a file (${type})`, () => {
      return mfs.write(path, content, {
        create: true,
        parents: true,
        length: 2
      })
        .then(() => mfs.read(path))
        .then((buffer) => {
          expect(buffer.length).to.equal(2)
        })
    })
  })

  runTest(({type, path, content, contentSize}) => {
    it(`overwrites start of a file without truncating (${type})`, () => {
      const newContent = Buffer.from('Goodbye world')

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, newContent))
        .then((result) => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(contentSize))
        .then(() => mfs.read(path, {
          offset: 0,
          length: newContent.length
        }))
        .then((buffer) => expect(buffer).to.deep.equal(newContent))
    })
  })

  runTest(({type, path, content, contentSize}) => {
    it(`pads the start of a new file when an offset is specified (${type})`, () => {
      const offset = 10

      return mfs.write(path, content, {
        offset,
        create: true
      })
        .then(() => mfs.stat(path))
        .then((stats) => {
          expect(stats.size).to.equal(offset + contentSize)
        })
        .then(() => mfs.read(path, {
          offset: 0,
          length: offset
        }))
        .then((buffer) => {
          expect(buffer).to.deep.equal(Buffer.alloc(offset, 0))
        })
    })
  })

  it.skip('truncates a file when requested', () => {

  })

  it.skip('writes a file with raw blocks for newly created leaf nodes', () => {

  })

  it.skip('writes a file with a different CID version to the parent', () => {

  })

  it.skip('writes a file with a different hash function to the parent', () => {

  })
})
