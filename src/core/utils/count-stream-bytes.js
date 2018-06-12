'use strict'

const through = require('pull-stream/throughs/through')

const countStreamBytes = (callback) => {
  let bytesRead = 0

  return through((buffer) => {
    bytesRead += buffer.length
  }, () => {
    callback(bytesRead)
  })
}

module.exports = countStreamBytes
