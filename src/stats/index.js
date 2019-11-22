'use strict'

const callbackify = require('callbackify')
const { streamify, pullify } = require('../lib/converters')

module.exports = config => {
  const bw = require('./bw')(config)
  return {
    bitswap: callbackify.variadic(require('../bitswap/stat')(config)),
    bw: callbackify.variadic(async options => {
      for await (const stats of bw(options)) {
        return stats
      }
    }),
    bwReadableStream: streamify.readable(bw),
    bwPullStream: pullify.source(bw),
    repo: callbackify.variadic(require('../repo/stat')(config))
  }
}
