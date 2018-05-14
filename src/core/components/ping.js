'use strict'

const promisify = require('promisify-es6')
const pull = require('pull-stream/pull')

module.exports = function ping (self) {
  return promisify((peerId, opts, cb) => {
    pull(
      self.pingPullStream(peerId, opts),
      pull.collect(cb)
    )
  })
}
