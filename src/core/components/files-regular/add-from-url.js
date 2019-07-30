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
      const parsedUrl = new URL(url)
      const res = await ky(url, {
        timeout: 15000,
        retry: 3
      })

      if (!res.ok) {
        throw new Error('unexpected status code: ' + res.status)
      }

      // TODO: use res.body when supported
      const content = Buffer.from(await res.arrayBuffer())
      const path = decodeURIComponent(parsedUrl.pathname.split('/').pop())

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
