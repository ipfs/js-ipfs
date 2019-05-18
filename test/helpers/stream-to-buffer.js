'use strict'

module.exports = async (stream) => {
  let buffer = Buffer.alloc(0)

  for await (const buf of stream) {
    buffer = Buffer.concat([buffer, buf], buffer.length + buf.length)
  }

  return buffer
}
