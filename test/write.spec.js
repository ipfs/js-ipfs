/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')
const isNode = require('detect-node')
const values = require('pull-stream/sources/values')
const bufferStream = require('pull-buffer-stream')
const {
  collectLeafCids,
  createMfs
} = require('./helpers')

let fs

if (isNode) {
  fs = require('fs')
}

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

  it('explodes if it cannot convert content to a pull stream', () => {
    return mfs.write('/foo', -1, {
      create: true
    })
      .then(() => expect(false).to.equal(true))
      .catch((error) => {
        expect(error.message).to.contain('Don\'t know how to convert -1 into a pull stream source')
      })
  })

  it('explodes if given an invalid path', () => {
    return mfs.write('foo', null, {
      create: true
    })
      .then(() => expect(false).to.equal(true))
      .catch((error) => {
        expect(error.message).to.contain('paths must start with a leading /')
      })
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

  it('writes part of a small file using a path (Node only)', function () {
    if (!isNode) {
      return this.skip()
    }

    const filePath = `/small-file-${Math.random()}.txt`
    const pathToFile = path.resolve(path.join(__dirname, 'fixtures', 'small-file.txt'))

    return mfs.write(filePath, pathToFile, {
      create: true,
      length: 2
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(2)
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
        .then(() => mfs.stat(path))
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

  runTest(({type, path, content, contentSize}) => {
    it(`expands a file when an offset is specified (${type})`, () => {
      const offset = contentSize - 1
      const newContent = Buffer.from('Oh hai!')

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, newContent, {
          offset
        }))
        .then(() => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(contentSize + newContent.length - 1))
        .then(() => mfs.read(path, {
          offset
        }))
        .then((buffer) => expect(buffer).to.deep.equal(newContent))
    })
  })

  runTest(({type, path, content, contentSize}) => {
    it(`expands a file when an offset is specified and the offset is longer than the file (${type})`, () => {
      const offset = contentSize + 5
      const newContent = Buffer.from('Oh hai!')

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, newContent, {
          offset
        }))
        .then(() => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(newContent.length + offset))
        .then(() => mfs.read(path, {
          offset: offset - 5
        }))
        .then((buffer) => {
          expect(buffer).to.deep.equal(Buffer.concat([Buffer.from([0, 0, 0, 0, 0]), newContent]))
        })
    })
  })

  runTest(({type, path, content}) => {
    it(`truncates a file after writing (${type})`, () => {
      const newContent = Buffer.from('Oh hai!')

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, newContent, {
          truncate: true
        }))
        .then(() => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(newContent.length))
        .then(() => mfs.read(path))
        .then((buffer) => expect(buffer).to.deep.equal(newContent))
    })
  })

  runTest(({type, path, content}) => {
    it(`truncates a file after writing with a stream (${type})`, () => {
      const newContent = Buffer.from('Oh hai!')
      const stream = values([newContent])

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, stream, {
          truncate: true
        }))
        .then(() => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(newContent.length))
        .then(() => mfs.read(path))
        .then((buffer) => expect(buffer).to.deep.equal(newContent))
    })
  })

  runTest(({type, path, content}) => {
    it(`truncates a file after writing with a stream with an offset (${type})`, () => {
      const offset = 100
      const newContent = Buffer.from('Oh hai!')
      const stream = values([newContent])

      return mfs.write(path, content, {
        create: true
      })
        .then(() => mfs.write(path, stream, {
          truncate: true,
          offset
        }))
        .then(() => mfs.stat(path))
        .then((stats) => expect(stats.size).to.equal(offset + newContent.length))
    })
  })

  runTest(({type, path, content}) => {
    it(`writes a file with raw blocks for newly created leaf nodes (${type})`, () => {
      return mfs.write(path, content, {
        create: true,
        rawLeaves: true
      })
        .then(() => mfs.stat(path))
        .then((stats) => collectLeafCids(mfs.node, stats.hash))
        .then((cids) => {
          const rawNodes = cids
            .filter(cid => cid.codec === 'raw')

          expect(rawNodes).to.not.be.empty()
        })
    })
  })

  it('supports concurrent writes', function () {
    const files = []

    for (let i = 0; i < 10; i++) {
      files.push({
        name: `source-file-${Math.random()}.txt`,
        source: bufferStream(100)
      })
    }

    return Promise.all(
      files.map(({name, source}) => mfs.write(`/concurrent/${name}`, source, {
        create: true,
        parents: true
      }))
    )
      .then(() => mfs.ls('/concurrent'))
      .then(listing => {
        expect(listing.length).to.equal(files.length)

        listing.forEach(listedFile => {
          expect(files.find(file => file.name === listedFile.name))
        })
      })
  })

  it('rewrites really big files', function () {
    let expectedBytes = Buffer.alloc(0)
    let originalBytes = Buffer.alloc(0)
    const initialStream = bufferStream(1024 * 300, {
      collector: (bytes) => {
        originalBytes = Buffer.concat([originalBytes, bytes])
      }
    })
    const newDataStream = bufferStream(1024 * 300, {
      collector: (bytes) => {
        expectedBytes = Buffer.concat([expectedBytes, bytes])
      }
    })

    const fileName = `/rewrite/file-${Math.random()}.txt`

    return mfs.write(fileName, initialStream, {
      create: true,
      parents: true
    })
      .then(() => mfs.write(fileName, newDataStream, {
        offset: 0
      }))
      .then(() => mfs.read(fileName))
      .then(actualBytes => {
        for (var i = 0; i < expectedBytes.length; i++) {
          if (expectedBytes[i] !== actualBytes[i]) {
            if (originalBytes[i] === actualBytes[i]) {
              throw new Error(`Bytes at index ${i} were not overwritten - expected ${expectedBytes[i]} actual ${originalBytes[i]}`)
            }

            throw new Error(`Bytes at index ${i} not equal - expected ${expectedBytes[i]} actual ${actualBytes[i]}`)
          }
        }

        expect(actualBytes).to.deep.equal(expectedBytes)
      })
  })

  it.skip('writes a file with a different CID version to the parent', () => {

  })

  it.skip('writes a file with a different hash function to the parent', () => {

  })
})
