'use strict'

const toStream = require('pull-stream-to-stream')

module.exports = function (self) {
  return (options) => {
    return toStream.source(self.refs.localPullStream(options))
  }
}
