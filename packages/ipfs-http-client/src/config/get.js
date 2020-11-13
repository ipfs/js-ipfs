'use strict'

const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').ImplementsMethod<'get', import('ipfs-core/src/components/config')>}
   */
  const get = async (key, options = {}) => {
    if (!key) {
      throw new Error('key argument is required')
    }

    const res = await api.post('config', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: key,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    return data.Value
  }

  return get
})
