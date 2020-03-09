'use strict'

const bIndexOf = require('buffer-indexof')
const parseHeaders = require('parse-headers')

module.exports = multipart

async function* multipart(stream, boundary) {
  if (!boundary) {
    if (
      stream &&
      stream.headers &&
      stream.headers['content-type'] &&
      stream.headers['content-type'].includes('boundary')
    ) {
      boundary = stream.headers['content-type'].split('boundary=')[1].trim()
    } else {
      throw new Error('Not a multipart request')
    }
  }

  boundary = `--${boundary}`
  const headerEnd = Buffer.from('\r\n\r\n')

  // allow pushing data back into stream
  stream = prefixStream(stream)

  // consume initial boundary
  await consumeUntilAfter(stream, Buffer.from(boundary))

  for await (const chunk of stream) {
    console.log('multipart chunk', chunk)
    stream.push(chunk)

    const headers = (await collect(yieldUntilAfter(stream, headerEnd))).toString()

    console.log({ headers })

    // the final boundary has `--\r\n` appended to it
    if (headers === '--\r\n') {
      console.log('hit final boundary')
      return
    }

    const yieldUntilAfterResult = yieldUntilAfter(stream, Buffer.from(`\r\n${boundary}`))
    console.log({ yieldUntilAfterResult })

    // Just for logging
    for await (const yieldUntilAfterResultChunk of yieldUntilAfterResult) {
      console.log({ yieldUntilAfterResultChunk })
    }
    // end of extra logging code

    // wait for this part's body to be consumed before we try reading the next one
    const result = waitForStreamToBeConsumed(yieldUntilAfterResult)

    console.log({ result })

    const part = {
      headers: parseHeaders(headers),
      body: result.iterator
      // body: yieldUntilAfter(stream, Buffer.from(`\r\n${boundary}`))
    }

    yield part

    await result.complete
  }
}

// yield chunks of buffer until a the needle is reached. consume the needle without yielding it
async function* yieldUntilAfter(haystack, needle) {
  console.log('yieldUntilAfter')
  let buffer = Buffer.alloc(0)

  for await (const chunk of haystack) {
    console.log('yieldUntilAfter chunk', chunk)
    console.log(chunk.toString('utf8'))
    buffer = Buffer.concat([buffer, chunk], buffer.length + chunk.length) // slow

    const index = bIndexOf(buffer, needle)

    if (index !== -1) {
      console.log('&&&&&&')
      console.log('found needle!', needle)

      // found needle
      if (index > 0) {
        yield buffer.slice(0, index)
      }

      // consume needle but preserve rest of chunk
      haystack.push(buffer.slice(index + needle.length))

      return
    } else {
      console.log('????????')
      console.log('did NOT find needle!')
    }

    if (buffer.length > needle.length) {
      // can emit the beginning chunk as it does not contain the needle
      yield buffer.slice(0, buffer.length - needle.length)

      // cache the rest for next time
      buffer = buffer.slice(buffer.length - needle.length)
    }
  }

  // yield anything left over
  if (buffer.length) {
    yield buffer
  }
}

async function consumeUntilAfter(haystack, needle) {
  for await (const chunk of yieldUntilAfter(haystack, needle)) {
    console.log('consumeUntilAfter chunk', chunk)
    // eslint-disable-line no-unused-vars
  }
}

// a stream that lets us push content back into it for consumption elsewhere
function prefixStream(stream) {
  const buffer = []
  const streamIterator = stream[Symbol.asyncIterator]()

  const iterator = {
    [Symbol.asyncIterator]: () => {
      return iterator
    },
    next: () => {
      if (buffer.length) {
        return {
          done: false,
          value: buffer.shift()
        }
      }

      return streamIterator.next()
    },
    push: function(buf) {
      buffer.push(buf)
    }
  }

  return iterator
}

function waitForStreamToBeConsumed(stream) {
  let pending
  const complete = new Promise((resolve, reject) => {
    pending = {
      resolve,
      reject
    }
  })
  const streamIterator = stream[Symbol.asyncIterator]()

  const iterator = {
    [Symbol.asyncIterator]: () => {
      return iterator
    },
    next: async () => {
      try {
        const next = await streamIterator.next()

        if (next.done) {
          pending.resolve()
        }

        return next
      } catch (err) {
        pending.reject(err)
      }
    }
  }

  return {
    complete,
    iterator
  }
}

const collect = async (stream) => {
  const buffers = []
  let size = 0

  for await (const buf of stream) {
    size += buf.length
    buffers.push(buf)
  }

  return Buffer.concat(buffers, size)
}
