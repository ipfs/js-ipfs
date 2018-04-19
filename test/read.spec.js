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

describe('read', function () {
  this.timeout(30000)

  let mfs
  let smallFile = loadFixture(path.join('test', 'fixtures', 'small-file.txt'))

  before(() => {
    return createMfs()
      .then(instance => {
        mfs = instance
      })
  })

  after((done) => {
    mfs.node.stop(done)
  })

  it('reads a small file', () => {
    const filePath = '/small-file.txt'

    return mfs.write(filePath, smallFile, {
      create: true
    })
      .then(() => mfs.read(filePath))
      .then((buffer) => {
        expect(buffer).to.deep.equal(smallFile)
      })
  })

  it.skip('reads a file with an offset', () => {

  })

  it.skip('reads a file with a length', () => {

  })

  it.skip('reads a file with an offset and a length', () => {

  })
})
