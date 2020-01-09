'use strict'

const callbackify = require('callbackify')
const { collectify, streamify, pullify, concatify } = require('../lib/converters')

module.exports = config => {
  const ls = require('./ls')(config)
  const read = require('./read')(config)

  return {
    chmod: callbackify.variadic(require('./chmod')(config)),
    cp: callbackify.variadic(require('./cp')(config)),
    mkdir: callbackify.variadic(require('./mkdir')(config)),
    flush: callbackify.variadic(require('./flush')(config)),
    stat: callbackify.variadic(require('./stat')(config)),
    rm: callbackify.variadic(require('./rm')(config)),
    ls: callbackify.variadic(collectify(ls)),
    lsReadableStream: streamify.readable(ls),
    lsPullStream: pullify.source(ls),
    read: callbackify.variadic(concatify(read)),
    readReadableStream: streamify.readable(read),
    readPullStream: pullify.source(read),
    touch: callbackify.variadic(require('./touch')(config)),
    write: callbackify.variadic(require('./write')(config)),
    mv: callbackify.variadic(require('./mv')(config))
  }
}
