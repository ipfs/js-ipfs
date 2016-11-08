'use strict'

const httpRequest = require('http').request
const httpsRequest = require('https').request

module.exports = (protocol) => {
  if (protocol.indexOf('https') === 0) {
    return httpsRequest
  }

  return httpRequest
}
