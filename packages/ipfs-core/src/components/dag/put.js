'use strict'

const multicodec = require('multicodec')

/**
 * @param {string} name
 * @returns {number}
 */
const nameToCodec = name => multicodec[name.toUpperCase().replace(/-/g, '_')]
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Pin} config.pin
 * @param {import('.').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, pin, gcLock, preload }) => {
  /**
   * Store an IPLD format node
   *
   * @param {Object} dagNode
   * @param {PutOptions & AbortOptions} [options]
   * @returns {Promise<CID>}
   * @example
   * ```js
   * const obj = { simple: 'object' }
   * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })
   *
   * console.log(cid.toString())
   * // zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
   * ```
   */
  async function put (dagNode, options = {}) {
    const { cidVersion, format, hashAlg } = readEncodingOptions(options)

    const release = options.pin ? await gcLock.readLock() : null

    try {
      const cid = await ipld.put(dagNode, format, {
        hashAlg,
        cidVersion,
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
  }

  return withTimeoutOption(put)
}

/**
 *
 * @param {PutOptions} options
 */
const readEncodingOptions = (options) => {
  if (options.cid && (options.format || options.hashAlg)) {
    throw new Error('Can\'t put dag node. Please provide either `cid` OR `format` and `hashAlg` options.')
  } else if (((options.format && !options.hashAlg) || (!options.format && options.hashAlg))) {
    throw new Error('Can\'t put dag node. Please provide `format` AND `hashAlg` options.')
  }

  const { hashAlg, format } = options.cid != null
    ? { format: options.cid.code, hashAlg: undefined }
    : encodingCodes({ ...defaultCIDOptions, ...options })
  const cidVersion = readVersion({ ...options, format, hashAlg })

  return {
    cidVersion,
    format,
    hashAlg
  }
}

/**
 *
 * @param {Object} options
 * @param {number|string} options.format
 * @param {number|string} [options.hashAlg]
 */
const encodingCodes = ({ format, hashAlg }) => ({
  format: typeof format === 'string' ? nameToCodec(format) : format,
  hashAlg: typeof hashAlg === 'string' ? nameToCodec(hashAlg) : hashAlg
})

/**
 * Figures out what version of CID should be used given the options.
 *
 * @param {Object} options
 * @param {0|1} [options.version]
 * @param {CID} [options.cid]
 * @param {number} [options.format]
 * @param {number} [options.hashAlg]
 */
const readVersion = ({ version, cid, format, hashAlg }) => {
  // If version is passed just use that.
  if (typeof version === 'number') {
    return version
  // If cid is provided use version field from it.
  } else if (cid) {
    return cid.version
  // If it's dag-pb nodes use version 0
  } else if (format === multicodec.DAG_PB && hashAlg === multicodec.SHA2_256) {
    return 0
  } else {
  // Otherwise use version 1
    return 1
  }
}

/** @type {WithCIDOptions} */
const defaultCIDOptions = {
  format: multicodec.DAG_CBOR,
  hashAlg: multicodec.SHA2_256
}

/**
 * @typedef {PutWith & OtherPutOptions} PutOptions
 * @typedef {WithCID | WithCIDOptions} PutWith
 *
 *
 * @typedef {Object} WithCID
 * @property {CID} [cid]
 * // Note: We still stil need to reserve these fields otherwise it implies
 * // that those fields can still be there and have very different types.
 * @property {undefined} [format]
 * @property {undefined} [hashAlg]
 * @property {undefined} [version]
 *
 * @typedef {Object} WithCIDOptions
 * @property {undefined} [cid]
 * @property {string|number} format
 * @property {string|number} hashAlg
 * @property {0|1} [version]
 *
 * @typedef {Object} OtherPutOptions
 * @property {boolean} [pin=false]
 * @property {boolean} [preload=false]
 *
 * @typedef {import('.').CID} CID
 * @typedef {import('.').AbortOptions} AbortOptions
 */
