'use strict'

const toPull = require('stream-to-pull-stream')
const map = require('pull-stream/throughs/map')
const pull = require('pull-stream/pull')
const transformChunk = require('./bw-util')
const deferred = require('pull-defer')

module.exports = (send) => {
  return (opts) => {
    opts = opts || {}

    const p = deferred.source()

    send({
      path: 'stats/bw',
      qs: opts
    }, (err, stream) => {
      if (err) {
        return p.end(err)
      }

      p.resolve(pull(
        toPull.source(stream),
        map(transformChunk)
      ))
    })

    return p
  }
}
