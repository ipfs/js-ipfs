'use strict'

const multicodec = require('multicodec')
const multihashes = require('multihashing-async').multihash

/**
 * @typedef {import('cids')} CID
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('multicodec').CodecCode} CodecCode
 * @typedef {import('multicodec').CodecName} CodecName
 * @typedef {import('multihashes').HashCode} HashCode
 * @typedef {import('multihashes').HashName} HashName
 */
/**
 *
 * @param {CodecName} name
 */
const nameToCodec = name => multicodec.getCodeFromName(name)
/**
 * @param {HashName} name
 */
const nameToHashCode = name => multihashes.names[name]
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('ipfs-core-types/src/pin').API} config.pin
 * @param {import('../../types').Preload} config.preload
 * @param {import('.').GCLock} config.gcLock
 */
module.exports = ({ ipld, pin, gcLock, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["put"]}
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
 * @param {import('ipfs-core-types/src/dag').PutOptions} options
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
 * @param {CodecCode|CodecName} options.format
 * @param {HashCode|HashName} [options.hashAlg]
 */
const encodingCodes = ({ format, hashAlg }) => ({
  format: typeof format === 'string' ? nameToCodec(format) : format,
  hashAlg: typeof hashAlg === 'string' ? nameToHashCode(hashAlg) : hashAlg
})

/**
 * Figures out what version of CID should be used given the options.
 *
 * @param {Object} options
 * @param {CIDVersion} [options.version]
 * @param {CID} [options.cid]
 * @param {CodecCode} [options.format]
 * @param {HashCode} [options.hashAlg]
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

const defaultCIDOptions = {
  format: multicodec.getCodeFromName('dag-cbor'),
  hashAlg: multihashes.names['sha2-256']
}
