'use strict'

const pump = require('pump')
const TransformStream = require('readable-stream').Transform
const streamToValue = require('./stream-to-value')

/*
  Transforms a stream of {Name, Hash} objects to include size
  of the DAG object.

  Usage: inputStream.pipe(new Converter())

  Input object format:
  {
    Name: '/path/to/file/foo.txt',
    Hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP'
    Size: '20'
  }

  Output object format:
  {
    path: '/path/to/file/foo.txt',
    hash: 'Qma4hjFTnCasJ8PVp3mZbZK5g2vGDT4LByLJ7m8ciyRFZP',
    size: 20
  }
*/
class ConverterStream extends TransformStream {
  constructor (options) {
    const opts = Object.assign({}, options || {}, { objectMode: true })
    super(opts)
  }

  _transform (obj, enc, callback) {
    if (!obj.Hash) {
      return callback()
    }

    callback(null, {
      path: obj.Name,
      hash: obj.Hash,
      size: parseInt(obj.Size, 10)
    })
  }
}

function converter (inputStream, callback) {
  const outputStream = new ConverterStream()
  pump(
    inputStream,
    outputStream,
    (err) => {
      if (err) {
        callback(err)
      }
    })

  streamToValue(outputStream, callback)
}

exports = module.exports = converter
exports.ConverterStream = ConverterStream
