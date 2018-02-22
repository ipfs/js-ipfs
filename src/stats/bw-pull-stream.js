'use strict'

const toPull = require('stream-to-pull-stream')
const pull = require('pull-stream')
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
        pull.map(transformChunk)
      ))
    })

    return p
  }
}
