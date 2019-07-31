'use strict'

const { URL } = require('iso-url')
const { default: ky } = require('ky-universal')

module.exports = (self) => {
  return async (url, options, callback) => {
    if (typeof options === 'function') {
      callback = options
      options = {}
    }

    let files
    try {
      const res = await ky.get(url)
      const path = decodeURIComponent(new URL(res.url).pathname.split('/').pop())
      const content = Buffer.from(await res.arrayBuffer())
      files = await self.add({ content, path }, options)
    } catch (err) {
      if (callback) {
        return callback(err)
      }
      throw err
    }

    if (callback) {
      callback(null, files)
    }

    return files
  }
}
