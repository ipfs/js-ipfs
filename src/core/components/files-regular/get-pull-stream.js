'use strict'

const toPullStream = require('async-iterator-to-pull-stream')
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')

module.exports = function (self) {
  return function getPullStream (ipfsPath, options) {
    return pull(
      toPullStream.source(self._getAsyncIterator(ipfsPath, options)),
      map(file => {
        if (file.content) {
          file.content = toPullStream.source(file.content())
        }

        return file
      })
    )
  }
}
