/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
chai.use(dirtyChai)
const utils = require('../../src/core/components/files-regular/utils')

describe('files-regular/utils', () => {
  describe('parseChunkerString', () => {
    it('handles an empty string', () => {
      const options = utils.parseChunkerString('')
      expect(options.chunker).to.equal('fixed')
    })

    it('handles a null chunker string', () => {
      const options = utils.parseChunkerString(null)
      expect(options.chunker).to.equal('fixed')
    })

    it('parses a fixed size string', () => {
      const options = utils.parseChunkerString('size-512')
      expect(options.chunker).to.equal('fixed')
      expect(options.chunkerOptions.maxChunkSize).to.equal(512)
    })

    it('parses a rabin string without size', () => {
      const options = utils.parseChunkerString('rabin')
      expect(options.chunker).to.equal('rabin')
      expect(options.chunkerOptions.avgChunkSize).to.equal(262144)
    })

    it('parses a rabin string with only avg size', () => {
      const options = utils.parseChunkerString('rabin-512')
      expect(options.chunker).to.equal('rabin')
      expect(options.chunkerOptions.avgChunkSize).to.equal(512)
    })

    it('parses a rabin string with min, avg, and max', () => {
      const options = utils.parseChunkerString('rabin-42-92-184')
      expect(options.chunker).to.equal('rabin')
      expect(options.chunkerOptions.minChunkSize).to.equal(42)
      expect(options.chunkerOptions.avgChunkSize).to.equal(92)
      expect(options.chunkerOptions.maxChunkSize).to.equal(184)
    })

    it('throws an error for unsupported chunker type', () => {
      const fn = () => utils.parseChunkerString('fake-512')
      expect(fn).to.throw(Error)
    })

    it('throws an error for incorrect format string', () => {
      const fn = () => utils.parseChunkerString('fixed-abc')
      expect(fn).to.throw(Error)
    })

    it('throws an error for incorrect rabin format string', () => {
      const fn = () => utils.parseChunkerString('rabin-1-2-3-4')
      expect(fn).to.throw(Error)
    })

    it('throws an error for non integer rabin parameters', () => {
      const fn = () => utils.parseChunkerString('rabin-abc')
      expect(fn).to.throw(Error)
    })
  })
})
