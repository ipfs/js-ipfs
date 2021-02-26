'use strict'

const Block = require('ipld-block')
const CID = require('cids')
const multihash = require('multihashes')
const multipartRequest = require('../lib/multipart-request')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/block/put')>}
   */
  async function put (data, options = {}) {
    if (Block.isBlock(data)) {
      const { name, length } = multihash.decode(data.cid.multihash)
      options = {
        ...options,
        format: data.cid.codec,
        mhtype: name,
        mhlen: length,
        version: data.cid.version
      }
      // @ts-ignore - data is typed as block so TS complains about
      // Uint8Array assignment.
      data = data.data
    } else if (options.cid) {
      const cid = new CID(options.cid)
      const { name, length } = multihash.decode(cid.multihash)
      options = {
        ...options,
        format: cid.codec,
        mhtype: name,
        mhlen: length,
        version: cid.version
      }
      delete options.cid
    }

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, options.signal)

    let res
    try {
      // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
      const response = await api.post('block/put', {
        timeout: options.timeout,
        signal: signal,
        searchParams: toUrlSearchParams(options),
        ...(
          await multipartRequest(data, controller, options.headers)
        )
      })
      res = await response.json()
    } catch (err) {
      // Retry with "protobuf"/"cbor" format for go-ipfs
      // TODO: remove when https://github.com/ipfs/go-cid/issues/75 resolved
      if (options.format === 'dag-pb') {
        return put(data, { ...options, format: 'protobuf' })
      } else if (options.format === 'dag-cbor') {
        return put(data, { ...options, format: 'cbor' })
      }

      throw err
    }

    return new Block(/** @type {Uint8Array} */(data), new CID(res.Key))
  }

  return put
})
