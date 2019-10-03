'use strict'

const kyDefault = require('ky-universal').default
const toIterable = require('./lib/stream-to-iterable')

module.exports = (config) => {
  const add = require('./add')(config)

  return (url, options) => (async function * () {
    options = options || {}

    const { body } = await kyDefault.get(url)

    const input = {
      path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
      content: toIterable(body)
    }

    yield * add(input, options)
  })()
}
