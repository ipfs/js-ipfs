'use strict'

const toStream = require('pull-stream-to-stream')

module.exports = function (self) {
  return (ipfsPath, options) => {
    return toStream.source(self.refsPullStream(ipfsPath, options))
  }
}
