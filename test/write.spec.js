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

  const runTest = (testName, fn) => {
    let i = 0
    const iterations = 5
    const files = [{
      type: 'Small file',
      path: `/small-file-${Math.random()}.txt`,
      content: smallFile
    }, {
      type: 'Large file',
      path: `/large-file-${Math.random()}.jpg`,
      content: largeFile
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
      }
    }]

    files.forEach((file) => {
      it(`${testName} (${file.type})`, () => {
        return fn(file)
      })
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

  runTest('limits how many bytes to write to a file', ({path, content, asBuffer}) => {
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

  it('overwrites part of a really large file without truncating', () => {
    const filePath = `/really-large-file-${Math.random()}.jpg`
    let i = 0
    const iterations = 5

    const source = (end, callback) => {
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
    }

    const newContent = Buffer.from([0, 1, 2, 3])
    const offset = parseInt((iterations * largeFile.length) / 2, 10)

    return mfs.write(filePath, source, {
      create: true
    })
      .then(() => mfs.write(filePath, newContent, {
        offset
      }))
      .then(() => mfs.read(filePath, {
        offset,
        length: newContent.length
      }))
      .then((buffer) => {
        // cannot verify this until ipfs/js-ipfs-unixfs-engine#209 is merged
        // expect(buffer).to.deep.equal(newContent)
      })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(largeFile.length * iterations)
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
