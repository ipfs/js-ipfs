'use strict'

const toAsyncIterableOriginal = require('stream-to-it/source')

// Note: Turned this into a helper that wraps `stream-to-it/source`
// to handle the body undefined case without requiring that other libs
// that consume that package such as `js-ipfs` and `js-ipfs-utils` modify
// how they use it

module.exports = function toAsyncIterable (res) {
  const { body } = res

  // An env where res.body getter for ReadableStream with getReader
  // is not supported, for example in React Native
  if (!body) {
    if (res.arrayBuffer) {
      return (async function * () {
        const arrayBuffer = await res.arrayBuffer()
        yield arrayBuffer
      })()
    } else {
      throw new Error('Neither Response.body nor Response.arrayBuffer is defined')
    }
  }

  return toAsyncIterableOriginal(body)
}
