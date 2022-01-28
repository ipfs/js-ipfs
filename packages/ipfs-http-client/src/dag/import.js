import { configure } from '../lib/configure.js'
import { toUrlSearchParams } from '../lib/to-url-search-params.js'
import { abortSignal } from '../lib/abort-signal.js'
import { multipartRequest } from 'ipfs-core-utils/multipart-request'
import { CID } from 'multiformats/cid'

/**
 * @typedef {import('../types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/dag').API<HTTPClientExtraOptions>} DAGAPI
 */

export const createImport = configure(api => {
  /**
   * @type {DAGAPI["import"]}
   */
  async function * dagImport (source, options = {}) {
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)
    const { headers, body } = await multipartRequest(source, controller, options.headers)

    const res = await api.post('dag/import', {
      signal,
      headers,
      body,
      searchParams: toUrlSearchParams({ 'pin-roots': options.pinRoots })
    })

    for await (const { Root } of res.ndjson()) {
      if (Root !== undefined) {
        const { Cid: { '/': Cid }, PinErrorMsg } = Root

        yield {
          root: {
            cid: CID.parse(Cid),
            pinErrorMsg: PinErrorMsg
          }
        }
      }
    }
  }

  return dagImport
})
