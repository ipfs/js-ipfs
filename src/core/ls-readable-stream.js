'use strict'

const lsPullStream = require('./ls-pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = (context) => {
  return function mfsLsReadableStream (path, options = {}) {
    return toStream.source(lsPullStream(context)(path, options))
  }
}
