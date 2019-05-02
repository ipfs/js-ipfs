'use strict'
const { Readable } = require('readable-stream')
const { supportsFileReader } = require('../supports')

const streamFromFileReader = (file, options) => {
  if (!supportsFileReader) {
    throw new Error('FileReader DOM API is not supported.')
  }
  class FileStream extends Readable {
    constructor (file, options = {}) {
      super(options)
      this.file = file
      this.offset = options.offset || 0
      this.chunkSize = options.chunkSize || 1024 * 1024
      this.fileReader = new self.FileReader(file)
      this.fileReader.onloadend = (event) => {
        const data = event.target.result
        if (data.byteLength === 0) {
          this.push(null)
        }
        this.push(new Uint8Array(data))
      }
      this.fileReader.onerror = (err) => this.destroy(err)
    }

    _read (size) {
      const end = this.offset + this.chunkSize
      const slice = file.slice(this.offset, end)
      this.fileReader.readAsArrayBuffer(slice)
      this.offset = end
    }
  }

  return new FileStream(file, options)
}

module.exports = streamFromFileReader
