'use strict'

const Transform = require('readable-stream').Transform

/*
  A transform stream to track progress events on file upload

  When the progress flag is passed to the HTTP api, the stream
  emits progress events like such:

  {
    Name  string
    Hash  string `json:",omitempty"`
    Bytes int64  `json:",omitempty"`
    Size  string `json:",omitempty"`
  }

  This class will take care of detecting such
  events and calling the associated track method
  with the bytes sent so far as parameter. It will
  also skip them from the stream, emitting only
  when the final object has been uploaded and we
  got a hash.
*/
class ProgressStream extends Transform {
  constructor (opts) {
    opts = Object.assign(opts || {}, { objectMode: true })
    super(opts)
    this._track = opts.track || (() => {})
  }

  static fromStream (track, stream) {
    const prog = new ProgressStream({ track })
    return stream.pipe(prog)
  }

  _transform (chunk, encoding, callback) {
    if (chunk &&
      typeof chunk.Bytes !== 'undefined' &&
      typeof chunk.Hash === 'undefined') {
      this._track(chunk.Bytes)
      return callback()
    }

    callback(null, chunk)
  }
}

module.exports = ProgressStream
