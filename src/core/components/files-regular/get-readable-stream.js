'use strict'

const pull = require('pull-stream')
const toStream = require('pull-stream-to-stream')

module.exports = function (self) {
  return (ipfsPath, options) => {
    options = options || {}

    return toStream.source(
      pull(
        self.getPullStream(ipfsPath, options),
        pull.map((file) => {
          if (file.content) {
            file.content = toStream.source(file.content)
            file.content.pause()
          }

          return file
        })
      )
    )
  }
}
