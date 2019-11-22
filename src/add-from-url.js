'use strict'

const kyDefault = require('ky-universal').default
const toIterable = require('./lib/stream-to-iterable')

module.exports = (config) => {
  const add = require('./add')(config)

  return async function * addFromURL (url, options) {
    options = options || {}

    const { body } = await kyDefault.get(url)

    const input = {
      path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
      content: toIterable(body)
    }

    yield * add(input, options)
  }
}
