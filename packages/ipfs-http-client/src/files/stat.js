import { CID } from 'multiformats/cid'
import { objectToCamelWithMetadata } from '../lib/object-to-camel-with-metadata.js'
import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/files').API<HTTPClientExtraOptions>} FilesAPI
 */

export const createStat = configure(api => {
  /**
   * @type {FilesAPI["stat"]}
   */
  async function stat (path, options = {}) {
    const res = await api.post('files/stat', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: path,
        ...options
      }),
      headers: options.headers
    })
    const data = await res.json()

    data.WithLocality = data.WithLocality || false
    return toCoreInterface(objectToCamelWithMetadata(data))
  }
  return stat
})

/**
 * @param {*} entry
 */
function toCoreInterface (entry) {
  entry.cid = CID.parse(entry.hash)
  delete entry.hash
  return entry
}
