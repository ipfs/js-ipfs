'use strict'

const { default: ky } = require('ky-universal')
const toIterable = require('stream-to-it/source')

module.exports = async function * urlSource (url, options) {
  options = options || {}

  const { body } = await ky.get(url)

  yield {
    path: decodeURIComponent(new URL(url).pathname.split('/').pop() || ''),
    content: toIterable(body)
  }
}
