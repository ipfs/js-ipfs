'use strict'

const http = require('http')
const https = require('https')

module.exports = (protocol) => {
  if (protocol.indexOf('https') === 0) {
    return https.request
  }

  return http.request
}
