'use strict'

const tar = require('tar-stream')
const Readable = require('readable-stream')

// transform tar stream into readable stream of
// { path: 'string', content: Readable }
module.exports = (err, res, send, done) => {
  if (err) {
    return done(err)
  }

  const objStream = new Readable({ objectMode: true })
  objStream._read = function noop () {}

  res
    .pipe(tar.extract())
    .on('entry', (header, stream, next) => {
      stream.on('end', next)

      if (header.type !== 'directory') {
        objStream.push({
          path: header.name,
          content: stream
        })
      } else {
        objStream.push({
          path: header.name
        })
        stream.resume()
      }
    })
    .on('finish', () => {
      objStream.push(null)
    })

  done(null, objStream)
}
