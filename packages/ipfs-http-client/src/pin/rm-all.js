import { CID } from 'multiformats/cid'
import { configure } from '../lib/configure.js'
import { normaliseInput } from 'ipfs-core-utils/pins/normalise-input'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/pin').API<HTTPClientExtraOptions>} PinAPI
 */

export const createRmAll = configure(api => {
  /**
   * @type {PinAPI["rmAll"]}
   */
  async function * rmAll (source, options = {}) {
    for await (const { path, recursive } of normaliseInput(source)) {
      const searchParams = new URLSearchParams(options.searchParams)
      searchParams.append('arg', `${path}`)

      if (recursive != null) searchParams.set('recursive', String(recursive))

      const res = await api.post('pin/rm', {
        signal: options.signal,
        headers: options.headers,
        searchParams: toUrlSearchParams({
          ...options,
          arg: `${path}`,
          recursive
        })
      })

      for await (const pin of res.ndjson()) {
        if (pin.Pins) { // non-streaming response
          yield * pin.Pins.map((/** @type {string} */ cid) => CID.parse(cid))
          continue
        }
        yield CID.parse(pin)
      }
    }
  }
  return rmAll
})
