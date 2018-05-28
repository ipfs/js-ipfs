'use strict'

const toStream = require('pull-stream-to-stream')

module.exports = function pingReadableStream (self) {
  return (peerId, opts) => toStream.source(self.pingPullStream(peerId, opts))
}
