'use strict'

const multicodec = require('multicodec')
const nameToCodec = name => multicodec[name.toUpperCase().replace(/-/g, '_')]
const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, pin, gcLock, preload }) => {
  return withTimeoutOption(async function put (dagNode, options) {
    options = options || {}

    if (options.cid && (options.format || options.hashAlg)) {
      throw new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hashAlg` options.')
    } else if (((options.format && !options.hashAlg) || (!options.format && options.hashAlg))) {
      throw new Error('Can\'t put dag node. Please provide `format` AND `hashAlg` options.')
    }

    const optionDefaults = {
      format: multicodec.DAG_CBOR,
      hashAlg: multicodec.SHA2_256
    }

    // The IPLD expects the format and hashAlg as constants
    if (options.format && typeof options.format === 'string') {
      options.format = nameToCodec(options.format)
    }
    if (options.hashAlg && typeof options.hashAlg === 'string') {
      options.hashAlg = nameToCodec(options.hashAlg)
    }

    options = options.cid ? options : Object.assign({}, optionDefaults, options)

    // js-ipld defaults to verion 1 CIDs. Hence set version 0 explicitly for
    // dag-pb nodes
    if (options.version === undefined) {
      if (options.format === multicodec.DAG_PB && options.hashAlg === multicodec.SHA2_256) {
        options.version = 0
      } else {
        options.version = 1
      }
    }

    let release

    if (options.pin) {
      release = await gcLock.readLock()
    }

    try {
      const cid = await ipld.put(dagNode, options.format, {
        hashAlg: options.hashAlg,
        cidVersion: options.version,
        signal: options.signal
      })

      if (options.pin) {
        await pin.add(cid, {
          lock: false
        })
      }

      if (options.preload !== false) {
        preload(cid)
      }

      return cid
    } finally {
      if (release) {
        release()
      }
    }
  })
}
