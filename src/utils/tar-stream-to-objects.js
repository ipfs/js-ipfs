'use strict'

const pump = require('pump')
const tar = require('tar-stream')
const ReadableStream = require('readable-stream').Readable

class ObjectsStreams extends ReadableStream {
  constructor (options) {
    const opts = Object.assign(options || {}, { objectMode: true })
    super(opts)
  }

  _read () {}
}

/*
  Transform a tar stream into a stream of objects:

  Output format:
  { path: 'string', content: Stream<Readable> }
*/
const TarStreamToObjects = (inputStream, callback) => {
  let outputStream = new ObjectsStreams()
  let extractStream = tar.extract()

  extractStream
    .on('entry', (header, stream, next) => {
      stream.on('end', next)

      if (header.type !== 'directory') {
        outputStream.push({
          path: header.name,
          content: stream
        })
      } else {
        outputStream.push({
          path: header.name
        })
        stream.resume()
      }
    })
    .on('finish', () => outputStream.push(null))

  pump(inputStream, extractStream)
  callback(null, outputStream)
}

module.exports = TarStreamToObjects
