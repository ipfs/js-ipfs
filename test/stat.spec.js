/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const {
  createMfs,
  EMPTY_DIRECTORY_HASH
} = require('./fixtures')

describe('stat', function () {
  this.timeout(30000)

  let mfs

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
      .then(() => expect.fail('No error was thrown for an empty path'))
      .catch(error => {
        expect(error.message).to.contain('paths must not be empty')
      })
  })

  it('refuses to lists files with an invalid path', () => {
    return mfs.stat('not-valid')
      .then(() => expect.fail('No error was thrown for an empty path'))
      .catch(error => {
        expect(error.message).to.contain('paths must start with a leading /')
      })
  })

  it('fails to stat non-existent file', () => {
    return mfs.stat('/i-do-not-exist')
      .then(() => expect.fail('No error was thrown for a non-existent file'))
      .catch(error => {
        expect(error.message).to.contain('file does not exist')
      })
  })

  it('stats an empty directory', () => {
    const path = '/empty-directory'

    return mfs.mkdir('/empty-directory')
      .then(() => mfs.stat(path))
      .then(stats => {
        expect(stats.size).to.equal(0)
        expect(stats.cumulativeSize).to.equal(4)
        expect(stats.childBlocks).to.equal(0)
        expect(stats.type).to.equal('directory')
      })
  })

  it('returns only a hash', () => {
    const path = '/empty-directory'

    return mfs.mkdir('/empty-directory')
      .then(() => mfs.stat(path, {
        hash: true
      }))
      .then(stats => {
        expect(Object.keys(stats).length).to.equal(1)
        expect(stats.hash).to.equal(EMPTY_DIRECTORY_HASH)
      })
  })

  it('returns only the size', () => {
    const path = '/empty-directory'

    return mfs.mkdir('/empty-directory')
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

  it.skip('stats a file', () => {

  })
})
