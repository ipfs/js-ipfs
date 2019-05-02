'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const validate = require('../../src/files/add-input-validation')
const { supportsFileReader } = require('../../src/supports')
const { Buffer } = require('buffer')
const { Readable } = require('readable-stream')
const empty = require('pull-stream/sources/empty')

chai.use(dirtyChai)
const expect = chai.expect

describe('add-input-validation', function () {
  it('validates correct primitive input types', function () {
    expect(validate(Buffer.from(('test')))).to.be.true()
    expect(validate(new Readable())).to.be.true()
    expect(validate(empty())).to.be.true()

    if (supportsFileReader) {
      const file = new self.File(['test'], 'test.txt', { type: 'text/plain' })
      expect(validate(file)).to.be.true()
    }
  })

  it('validates correct array of primitive input types', function () {
    expect(validate([Buffer.from('test'), Buffer.from('test')])).to.be.true()
    expect(validate([new Readable(), new Readable()])).to.be.true()
    expect(validate([empty(), empty()])).to.be.true()

    if (supportsFileReader) {
      const file = new self.File(['test'], 'test.txt', { type: 'text/plain' })
      expect(validate([file, file])).to.be.true()
    }
  })

  it('validates correct form of object input', function () {
    expect(validate({ path: '/path' })).to.be.true()
    expect(validate({ path: '/path', content: Buffer.from('test') })).to.be.true()
    expect(validate({ content: new Readable() })).to.be.true()
    expect(validate({ content: empty() })).to.be.true()
    if (supportsFileReader) {
      expect(validate({ content: new Readable() })).to.be.true()
    }
  })

  it('should throw with bad input', function () {
    const regex = /Input not supported/
    expect(() => validate('test')).throw(regex)
    expect(() => validate(2)).throw(regex)
    expect(() => validate({ path: 3 })).throw(regex)
    expect(() => validate({ path: 'path', content: 'test' })).throw(regex)
    expect(() => validate({ path: 'path', content: 2 })).throw(regex)
    expect(() => validate({})).throw(regex)
  })
})
