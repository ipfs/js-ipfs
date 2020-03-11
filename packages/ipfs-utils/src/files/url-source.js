'use strict'

const Http = require('../http')

module.exports = async function * urlSource (url, options) {
  options = options || {}
  const http = new Http()

  yield {
    path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
    content: await http.iterator(url, { method: 'get' })
  }
}
