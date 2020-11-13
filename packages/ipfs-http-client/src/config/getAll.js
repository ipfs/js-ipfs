'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'getAll', import('ipfs-core/src/components/config')>}
   */
  const getAll = async (options = {}) => {
    const res = await api.post('config/show', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data
  }

  return getAll
})
