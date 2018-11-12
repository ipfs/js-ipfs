'use strict'

const readPullStream = require('./read-pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = (context) => {
  return function mfsReadReadableStream (path, options = {}) {
    return toStream.source(readPullStream(context)(path, options))
  }
}
