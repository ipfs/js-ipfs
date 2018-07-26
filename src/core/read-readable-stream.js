'use strict'

const readPullStream = require('./read-pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = (ipfs) => {
  return function mfsReadReadableStream (path, options = {}) {
    return toStream.source(readPullStream(ipfs)(path, options))
  }
}
