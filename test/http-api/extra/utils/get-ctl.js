'use strict'
const APIctl = require('ipfs-api')
module.exports = (http) => {
  return APIctl(http.api.apiMultiaddr)
}
