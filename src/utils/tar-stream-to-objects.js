'use strict'

const tar = require('tar-stream')
const { EventIterator } = require('event-iterator')

function pipe (reader, writable) {
  reader.read()
    .then(({ done, value }) => {
      if (done) {
        writable.end()

        return
      }

      if (value) {
        const beneathHighWaterMark = writable.write(value)

        if (beneathHighWaterMark) {
          pipe(reader, writable)
        } else {
          writable.once('drain', () => {
            pipe(reader, writable)
          })
        }
      }
    }, (err) => {
      writable.emit('error', err)
    })
}

/*
  Transform a tar readable stream into an async iterator of objects:

  Output format:
  { path: 'string', content: AsyncIterator<Buffer> }
*/
async function * tarStreamToObjects (inputStream) {
  const extractStream = tar.extract()
  let onEntry

  const tarStream = new EventIterator(
    (push, stop, fail) => {
      onEntry = (header, stream, next) => {
        push({ header, stream })

        next()
      }

      extractStream.addListener('entry', onEntry)
      extractStream.addListener('finish', stop)
      extractStream.addListener('error', fail)
    },
    (push, stop, fail) => {
      extractStream.removeListener('entry', onEntry)
      extractStream.removeListener('finish', stop)
      extractStream.removeListener('error', fail)
      extractStream.destroy()
    }
  )

  if (inputStream.pipe) {
    // node stream
    inputStream.pipe(extractStream)
  } else if (inputStream.getReader) {
    // browser readable stream
    pipe(inputStream.getReader(), extractStream)
  } else {
    throw new Error('Unknown stream type')
  }

  for await (const { header, stream } of tarStream) {
    if (header.type === 'directory') {
      yield {
        path: header.name
      }
    } else {
      yield {
        path: header.name,
        content: stream
      }
    }
  }
}

module.exports = tarStreamToObjects
