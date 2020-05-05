'use strict'

const modeToString = require('../lib/mode-to-string')
const mtimeToObject = require('../lib/mtime-to-object')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  return async (path, input, options = {}) => {
    const res = await api.post('files/write', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        streamChannels: true,
        count: options.count || options.length,
        ...options
      }),
      ...(
        await multipartRequest({
          content: input,
          path: 'arg',
          mode: modeToString(options.mode),
          mtime: mtimeToObject(options.mtime)
        }, options.headers)
      )
    })

    await res.text()
  }
})
