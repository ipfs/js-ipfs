'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async (template, options) => {
    if (typeof template !== 'string') {
      options = template
      template = null
    }

    options = options || {}

    const searchParams = new URLSearchParams(options.searchParams)
    if (template) searchParams.set('arg', template)

    const { Hash } = await ky.post('object/new', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    }).json()

    return new CID(Hash)
  }
})
