/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const {
  createMfs
} = require('./helpers')

describe('mkdir', function () {
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

  it('requires a directory', (done) => {
    mfs.mkdir('', (error) => {
      expect(error.message).to.contain('no path given')

      done()
    })
  })

  it('refuses to create a directory without a leading slash', (done) => {
    mfs.mkdir('foo', (error) => {
      expect(error.message).to.contain('paths must start with a leading /')

      done()
    })
  })

  it('refuses to recreate the root directory when -p is false', (done) => {
    mfs.mkdir('/', {
      parents: false
    }, (error) => {
      expect(error.message).to.contain("cannot create directory '/'")

      done()
    })
  })

  it('refuses to create a nested directory when -p is false', () => {
    return mfs.mkdir('/foo/bar/baz', {
      parents: false
    })
      .catch(error => {
        expect(error.message).to.contain('foo did not exist')
      })
  })

  it('creates a directory', () => {
    const path = '/foo'

    return mfs.mkdir(path, {})
      .then(() => mfs.ls(path))
      .then((files) => {
        expect(files.length).to.equal(0)
      })
  })

  it('refuses to create a directory that already exists', () => {
    const path = '/qux/quux/quuux'

    return mfs.mkdir(path, {
      parents: true
    })
      .then(() => mfs.mkdir(path, {
        parents: false
      }))
      .then(() => {
        throw new Error('Did not refuse to create a path that already exists')
      })
      .catch((error) => {
        expect(error.message).to.contain('file already exists')
      })
  })

  it('does not error when creating a directory that already exists and parents is true', () => {
    const path = '/qux/quux/quuux'

    return mfs.mkdir(path, {
      parents: true
    })
      .then(() => mfs.mkdir(path, {
        parents: true
      }))
  })

  it('creates a nested directory when -p is true', function () {
    const path = '/foo/bar/baz'

    return mfs.mkdir(path, {
      parents: true
    })
      .then(() => mfs.ls(path))
      .then((files) => {
        expect(files.length).to.equal(0)
      })
  })

  it.skip('creates a nested directory with a different CID version to the parent', () => {

  })

  it.skip('creates a nested directory with a different hash function to the parent', () => {

  })
})
