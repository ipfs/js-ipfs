'use strict'

const CID = require('cids')
const configure = require('../lib/configure')

module.exports = configure(api => {
  return async (template, options = {}) => {
    if (typeof template !== 'string') {
      options = template || {}
      template = null
    }

    const searchParams = new URLSearchParams(options)
    searchParams.set('arg', template)

    const res = await api.post('object/new', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams
    })

    const { Hash } = await res.json()

    return new CID(Hash)
  }
})
