'use strict'

const multicodec = require('multicodec')
/**
 *
 * @param {string} name
 * @returns {number}
 */
// @ts-ignore - TS can't infer dynamic access
const nameToCodec = name => multicodec[name.toUpperCase().replace(/-/g, '_')]
const { withTimeoutOption } = require('../../utils')

/**
 * @typedef {import('cids')} CID
 * @typedef {import("../init").IPLD} IPLDService
 * @typedef {import("../init").Pin} Pin
 * @typedef {import("../init").GCLock} GCLock
 * @typedef {import("../init").PreloadService} PreloadService
 *
 * @typedef {Object} PutConfig
 * @property {IPLDService} ipld
 * @property {Pin} pin
 * @property {GCLock} gcLock
 * @property {PreloadService} preload
 *
 * @typedef {Object} OptionsWithFormat
 * @property {string|number} format
 * @property {string|number} hashAlg
 *
 * @typedef {Object} OptionsWithCID
 * @property {CID} cid
 *
 * @typedef {Object} OthePutOptions
 * @property {boolean} [pin=false]
 * @property {number} [timetout]
 * @property {number} [version]
 * @property {boolean} [preload=false]
 * @property {AbortSignal} [signal]
 *
 * @typedef {(OptionsWithFormat|OptionsWithCID) & OthePutOptions} PutOptions
 *
 * @typedef {OptionsWithFormat & OptionsWithCID & OthePutOptions} NormalizedOptions
 */

/**
 * @param {PutConfig} config
 * @returns {Put}
 */
module.exports = ({ ipld, pin, gcLock, preload }) => {
  /**
   * Store an IPLD format node
   * @callback Put
   * @param {Object} dagNode
   * @param {PutOptions} [putOptions]
   * @returns {Promise<CID>}
   *
   * @type {Put}
   */
  async function put (dagNode, putOptions) {
    /** @type {OthePutOptions & {format:number|string, hashAlg:number|string, cid?:CID}} */
    let options = putOptions || {}

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
        cidVersion: options.version
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
