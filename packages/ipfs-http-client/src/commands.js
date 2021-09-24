import { configure } from './lib/configure.js'
import { toUrlSearchParams } from './lib/to-url-search-params.js'

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

export const createCommands = configure(api => {
  /**
   * @type {RootAPI["commands"]}
   */
  const commands = async (options = {}) => {
    const res = await api.post('commands', {
      signal: options.signal,
      searchParams: toUrlSearchParams(options),
      headers: options.headers
    })

    return res.json()
  }
  return commands
})
