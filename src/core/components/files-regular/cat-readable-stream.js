'use strict'

const toStream = require('pull-stream-to-stream')

module.exports = function (self) {
  return (ipfsPath, options) => toStream.source(self.catPullStream(ipfsPath, options))
}
