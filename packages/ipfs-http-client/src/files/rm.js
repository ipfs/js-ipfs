'use strict'

const configure = require('../lib/configure')
const { findSources } = require('./utils')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/files/rm')>}
   */
  async function rm (...args) {
    const { sources, options } = findSources(args)

    const res = await api.post('files/rm', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources,
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }

  return rm
})
