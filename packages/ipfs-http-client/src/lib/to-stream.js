'use strict'

const toStream = require('it-to-stream')

module.exports = (it) => {
  return toStream.readable(it)
}
