'use strict'

const toPull = require('stream-to-pull-stream')
const deferred = require('pull-defer')

module.exports = (send) => {
  return (args, opts) => {
    opts = opts || {}

    const p = deferred.source()

    send({
      path: 'files/read',
      args: args,
      qs: opts
    }, (err, stream) => {
      if (err) {
        return p.abort(err)
      }

      p.resolve(toPull(stream))
    })

    return p
  }
}
