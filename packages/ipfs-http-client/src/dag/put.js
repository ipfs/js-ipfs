'use strict'

const CID = require('cids')
const multihash = require('multihashes')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')
const abortSignal = require('../lib/abort-signal')
const { AbortController } = require('native-abort-controller')
const multicodec = require('multicodec')
const loadFormat = require('../lib/ipld-formats')

module.exports = configure((api, opts) => {
  const load = loadFormat(opts.ipld)

  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/dag/put')>}
   */
  const put = async (dagNode, options = {}) => {
    if (options.cid && (options.format || options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide either `cid` OR `format` and `hashAlg` options')
    } else if ((options.format && !options.hashAlg) || (!options.format && options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide `format` AND `hashAlg` options')
    }

    let encodingOptions
    if (options.cid) {
      const cid = new CID(options.cid)
      encodingOptions = {
        ...options,
        format: multicodec.getName(cid.code),
        hashAlg: multihash.decode(cid.multihash).name
      }
      delete options.cid
    } else {
      encodingOptions = options
    }

    const settings = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      inputEnc: 'raw',
      ...encodingOptions
    }

    const format = await load(settings.format)
    const serialized = format.util.serialize(dagNode)

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = abortSignal(controller.signal, settings.signal)

    // @ts-ignore https://github.com/ipfs/js-ipfs-utils/issues/90
    const res = await api.post('dag/put', {
      timeout: settings.timeout,
      signal,
      searchParams: toUrlSearchParams(settings),
      ...(
        await multipartRequest(serialized, controller, settings.headers)
      )
    })
    const data = await res.json()

    return new CID(data.Cid['/'])
  }

  return put
})
