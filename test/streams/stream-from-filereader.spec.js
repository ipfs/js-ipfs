'use strict'

/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const { supportsFileReader } = require('../../src/supports')
const streamFromFilereader = require('../../src/streams/stream-from-filereader')

chai.use(dirtyChai)
const expect = chai.expect

describe('stream-from-filereader', function () {
  it('should throw in not supported envs', function () {
    if (!supportsFileReader) {
      expect(() => streamFromFilereader()).throw('FileReader DOM API is not supported.')
    } else {
      this.skip()
    }
  })

  it('should return correct data from the stream', function (done) {
    if (supportsFileReader) {
      const s = streamFromFilereader(new self.File(['should return correct data from the stream'], 'filename.txt', { type: 'text/plain' }))
      s.on('data', d => {
        expect(d.toString()).to.eq('should return correct data from the stream')
        done()
      })
    } else {
      this.skip()
    }
  })

  it('should return correct ammount of data from the stream', function (done) {
    if (supportsFileReader) {
      const file = new self.File(['should return correct data from the stream'], 'filename.txt', { type: 'text/plain' })
      const s = streamFromFilereader(file, { chunkSize: 21 })
      let size = 0
      s.on('data', d => {
        expect(d.byteLength).to.eq(21)
        size += d.byteLength
      })
      s.on('end', () => {
        expect(size).to.eq(42)
        done()
      })
    } else {
      this.skip()
    }
  })

  it('should return correct data with offset', function (done) {
    if (supportsFileReader) {
      const file = new self.File(['should return correct data from the stream'], 'filename.txt', { type: 'text/plain' })
      const s = streamFromFilereader(file, { offset: 21 })
      s.on('data', d => {
        expect(d.toString()).to.eq(' data from the stream')
      })
      s.on('end', () => {
        done()
      })
    } else {
      this.skip()
    }
  })
})
