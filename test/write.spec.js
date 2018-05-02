/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')
const isNode = require('detect-node')
const values = require('pull-stream/sources/values')
const bufferStream = require('./fixtures/buffer-stream')
const CID = require('cids')
const UnixFs = require('ipfs-unixfs')
const {
  MAX_CHUNK_SIZE
} = require('../src/core/utils')

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
        .then((buffer) => expect(buffer).to.deep.equal(Buffer.concat([Buffer.from([0, 0, 0, 0, 0]), newContent])))
    })
  })

  it(`expands one DAGNode into a balanced tree`, () => {
    const path = `/some-file-${Math.random()}.txt`
    const data = []

    return mfs.write(path, bufferStream(MAX_CHUNK_SIZE - 10, {
      collector: (bytes) => data.push(bytes)
    }), {
      create: true
    })
      .then(() => mfs.stat(path))
      .then((stats) => mfs.node.dag.get(new CID(stats.hash)))
      .then((result) => result.value)
      .then((node) => {
        expect(node.links.length).to.equal(0)

        const meta = UnixFs.unmarshal(node.data)

        expect(meta.fileSize()).to.equal(data.reduce((acc, curr) => acc + curr.length, 0))
        expect(meta.data).to.deep.equal(data.reduce((acc, curr) => Buffer.concat([acc, curr]), Buffer.alloc(0)))
      })
      .then(() => mfs.write(path, bufferStream(20, {
        collector: (bytes) => data.push(bytes)
      }), {
        offset: MAX_CHUNK_SIZE - 10
      }))
      .then(() => mfs.stat(path))
      .then((stats) => mfs.node.dag.get(new CID(stats.hash)))
      .then((result) => result.value)
      .then((node) => {
        expect(node.links.length).to.equal(2)

        const meta = UnixFs.unmarshal(node.data)

        expect(meta.fileSize()).to.equal(data.reduce((acc, curr) => acc + curr.length, 0))
        expect(meta.data).to.equal(undefined)
      })
      .then(() => mfs.read(path))
      .then((buffer) => expect(buffer).to.deep.equal(data.reduce((acc, curr) => Buffer.concat([acc, curr]), Buffer.alloc(0))))
  })

  runTest(({type, path, content}) => {
    it.skip(`truncates a file when requested (${type})`, () => {
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

  it.skip('writes a file with raw blocks for newly created leaf nodes', () => {

  })

  it.skip('writes a file with a different CID version to the parent', () => {

  })

  it.skip('writes a file with a different hash function to the parent', () => {

  })
})
