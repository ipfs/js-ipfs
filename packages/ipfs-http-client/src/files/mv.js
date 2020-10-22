'use strict'

const CID = require('cids')
const { findSources } = require('./utils')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/files/mv')>}
   */
  async function mv (...args) {
    const { sources, options } = findSources(args)

    const res = await api.post('files/mv', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: sources.map(src => CID.isCID(src) ? `/ipfs/${src}` : src),
        ...options
      }),
      headers: options.headers
    })

    await res.text()
  }

  return mv
})
