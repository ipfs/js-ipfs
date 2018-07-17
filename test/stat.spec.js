/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const loadFixture = require('aegir/fixtures')

const {
  createMfs,
  EMPTY_DIRECTORY_HASH,
  EMPTY_DIRECTORY_HASH_BASE32
} = require('./helpers')

describe('stat', function () {
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

  it('refuses to stat files with an empty path', () => {
    return mfs.stat('')
      .then(() => {
        throw new Error('No error was thrown for an empty path')
      })
      .catch(error => {
        expect(error.message).to.contain('paths must not be empty')
      })
  })

  it('refuses to lists files with an invalid path', () => {
    return mfs.stat('not-valid')
      .then(() => {
        throw new Error('No error was thrown for an empty path')
      })
      .catch(error => {
        expect(error.message).to.contain('paths must start with a leading /')
      })
  })

  it('fails to stat non-existent file', () => {
    return mfs.stat('/i-do-not-exist')
      .then(() => {
        throw new Error('No error was thrown for a non-existent file')
      })
      .catch(error => {
        expect(error.message).to.contain('Path /i-do-not-exist did not exist')
      })
  })

  it('stats an empty directory', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.stat(path))
      .then(stats => {
        expect(stats.size).to.equal(0)
        expect(stats.cumulativeSize).to.equal(4)
        expect(stats.blocks).to.equal(0)
        expect(stats.type).to.equal('directory')
      })
  })

  it('returns only a hash', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.stat(path, {
        hash: true
      }))
      .then(stats => {
        expect(Object.keys(stats).length).to.equal(1)
        expect(stats.hash).to.equal(EMPTY_DIRECTORY_HASH)
      })
  })

  it('returns only a base32 hash', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.stat(path, {
        hash: true,
        cidBase: 'base32'
      }))
      .then(stats => {
        expect(Object.keys(stats).length).to.equal(1)
        expect(stats.hash).to.equal(EMPTY_DIRECTORY_HASH_BASE32)
      })
  })

  it('returns only the size', () => {
    const path = `/directory-${Math.random()}`

    return mfs.mkdir(path)
      .then(() => mfs.stat(path, {
        size: true
      }))
      .then(stats => {
        expect(Object.keys(stats).length).to.equal(1)
        expect(stats.size).to.equal(4) // protobuf size?!
      })
  })

  it.skip('computes how much of the DAG is local', () => {

  })

  it('stats a small file', () => {
    const filePath = '/stat/small-file.txt'

    return mfs.write(filePath, smallFile, {
      create: true,
      parents: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
        expect(stats.cumulativeSize).to.equal(71)
        expect(stats.blocks).to.equal(1)
        expect(stats.type).to.equal('file')
      })
  })

  it('stats a large file', () => {
    const filePath = '/stat/large-file.txt'

    return mfs.write(filePath, largeFile, {
      create: true,
      parents: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(largeFile.length)
        expect(stats.cumulativeSize).to.equal(490800)
        expect(stats.blocks).to.equal(2)
        expect(stats.type).to.equal('file')
      })
  })

  it('stats a large file with base32', () => {
    const filePath = '/stat/large-file.txt'

    return mfs.write(filePath, largeFile, {
      create: true,
      parents: true
    })
      .then(() => mfs.stat(filePath, {
        cidBase: 'base32'
      }))
      .then((stats) => {
        expect(stats.hash.startsWith('b')).to.equal(true)
        expect(stats.size).to.equal(largeFile.length)
        expect(stats.cumulativeSize).to.equal(490800)
        expect(stats.blocks).to.equal(2)
        expect(stats.type).to.equal('file')
      })
  })
})
