'use strict'

const dagCBOR = require('ipld-dag-cbor')
const dagPB = require('ipld-dag-pb')
const ipldRaw = require('ipld-raw')
const CID = require('cids')
const multihash = require('multihashes')
const configure = require('../lib/configure')
const multipartRequest = require('../lib/multipart-request')
const toUrlSearchParams = require('../lib/to-url-search-params')
const anySignal = require('any-signal')
const AbortController = require('abort-controller')
const multicodec = require('multicodec')

module.exports = configure((api, opts) => {
  const formats = {
    [multicodec.DAG_PB]: dagPB,
    [multicodec.DAG_CBOR]: dagCBOR,
    [multicodec.RAW]: ipldRaw
  }

  const ipldOptions = (opts && opts.ipld) || {}
  const configuredFormats = (ipldOptions && ipldOptions.formats) || []
  configuredFormats.forEach(format => {
    formats[format.codec] = format
  })

  return async (dagNode, options = {}) => {
    if (options.cid && (options.format || options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide either `cid` OR `format` and `hashAlg` options')
    } else if ((options.format && !options.hashAlg) || (!options.format && options.hashAlg)) {
      throw new Error('Failed to put DAG node. Provide `format` AND `hashAlg` options')
    }

    if (options.cid) {
      const cid = new CID(options.cid)
      options = {
        ...options,
        format: cid.codec,
        hashAlg: multihash.decode(cid.multihash).name
      }
      delete options.cid
    }

    options = {
      format: 'dag-cbor',
      hashAlg: 'sha2-256',
      inputEnc: 'raw',
      ...options
    }

    const number = multicodec.getNumber(options.format)
    let format = formats[number]

    if (!format) {
      if (opts && opts.ipld && opts.ipld.loadFormat) {
        format = await opts.ipld.loadFormat(options.format)
      }

      if (!format) {
        throw new Error('Format unsupported - please add support using the options.ipld.formats or options.ipld.loadFormat options')
      }
    }

    if (!format.util || !format.util.serialize) {
      throw new Error('Format does not support utils.serialize function')
    }

    const serialized = format.util.serialize(dagNode)

    // allow aborting requests on body errors
    const controller = new AbortController()
    const signal = anySignal([controller.signal, options.signal])

    const res = await api.post('dag/put', {
      timeout: options.timeout,
      signal,
      searchParams: toUrlSearchParams(options),
      ...(
        await multipartRequest(serialized, controller, options.headers)
      )
    })
    const data = await res.json()

    return new CID(data.Cid['/'])
  }
})
