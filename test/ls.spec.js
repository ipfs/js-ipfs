/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const {
  createMfs
} = require('./fixtures')

describe('ls', function () {
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

  it('lists the root directory by default', () => {
    const fileName = `small-file-${Math.random()}.txt`
    const content = Buffer.from('Hello world')

    return mfs.write(`/${fileName}`, content, {
      create: true
    })
      .then(() => mfs.ls())
      .then(files => {
        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal('file')
        expect(files[0].size).to.equal(content.length)
      })
  })

  it('refuses to lists files with an empty path', () => {
    return mfs.ls('')
      .then(() => {
        throw new Error('No error was thrown for an empty path')
      })
      .catch(error => {
        expect(error.message).to.contain('paths must not be empty')
      })
  })

  it('refuses to lists files with an invalid path', () => {
    return mfs.ls('not-valid')
      .then(() => {
        throw new Error('No error was thrown for an empty path')
      })
      .catch(error => {
        expect(error.message).to.contain('paths must start with a leading /')
      })
  })

  it('lists files in a directory', () => {
    const fileName = `small-file-${Math.random()}.txt`
    const content = Buffer.from('Hello world')

    return mfs.write(`/dir/${fileName}`, content, {
      create: true,
      parents: true
    })
      .then(() => mfs.ls('/dir', {}))
      .then(files => {
        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal('file')
        expect(files[0].size).to.equal(content.length)
      })
  })

  it('lists a file', () => {
    const fileName = `small-file-${Math.random()}.txt`
    const content = Buffer.from('Hello world')

    return mfs.write(`/${fileName}`, content, {
      create: true
    })
      .then(() => mfs.ls(`/${fileName}`))
      .then(files => {
        expect(files.length).to.equal(1)
        expect(files[0].name).to.equal(fileName)
        expect(files[0].type).to.equal('file')
        expect(files[0].size).to.equal(content.length)
      })
  })

  it('fails to list non-existent file', () => {
    return mfs.ls('/i-do-not-exist')
      .then(() => {
        throw new Error('No error was thrown for a non-existent file')
      })
      .catch(error => {
        expect(error.message).to.contain('did not exist')
      })
  })
})
