/* eslint-env mocha */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const path = require('path')
const fs = require('fs')

const {
  createMfs
} = require('./fixtures')

describe('write', function () {
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

  it('writes a small file', () => {
    const smallFile = fs.readFileSync(path.join(__dirname, 'fixtures', 'small-file.txt'))
    const filePath = '/small-file.txt'

    return mfs.write(filePath, smallFile)
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it('writes a deeply nested small file', () => {
    const smallFile = fs.readFileSync(path.join(__dirname, 'fixtures', 'small-file.txt'))
    const filePath = '/foo/bar/baz/qux/quux/garply/small-file.txt'

    return mfs.write(filePath, smallFile, {
      parents: true
    })
      .then(() => mfs.stat(filePath))
      .then((stats) => {
        expect(stats.size).to.equal(smallFile.length)
      })
  })

  it.skip('limits how many bytes to write to a file', () => {

  })

  it.skip('refuses to write to a file that does not exist', () => {

  })

  it.skip('overwrites part of a file without truncating', () => {

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
