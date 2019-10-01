'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const nodeify = require('promise-nodeify')
const { cidToString } = require('../../utils/cid')

/**
 * @typedef { import("../index") } IPFS
 */

/**
 * @typedef {Object} ResolveOptions
 * @prop {string} cidBase - Multibase codec name the CID in the resolved path will be encoded with
 * @prop {boolean} [recursive=true] - Resolve until the result is an IPFS name
 *
 */

/** @typedef {(err: Error, path: string) => void} ResolveCallback */

/**
 * @callback ResolveWrapper - This wrapper adds support for callbacks and promises
 * @param {string} name - Path to resolve
 * @param {ResolveOptions} opts - Options for resolve
 * @param {ResolveCallback} [cb] - Optional callback function
 * @returns {Promise<string> | void} - When callback is provided nothing is returned
 */

/**
 * IPFS Resolve factory
 *
 * @param {IPFS} ipfs
 * @returns {ResolveWrapper}
 */
module.exports = (ipfs) => {
  /**
   * IPFS Resolve - Resolve the value of names to IPFS
   *
   * @param {String} name
   * @param {ResolveOptions} [opts={}]
   * @returns {Promise<string>}
   */
  const resolve = async (name, opts) => {
    opts = opts || {}

    if (!isIpfs.path(name)) {
      throw new Error('invalid argument ' + name)
    }

    if (isIpfs.ipnsPath(name)) {
      name = await ipfs.name.resolve(name, opts)
    }

    const [, , hash, ...rest] = name.split('/') // ['', 'ipfs', 'hash', ...path]
    const cid = new CID(hash)

    // nothing to resolve return the input
    if (rest.length === 0) {
      return `/ipfs/${cidToString(cid, { base: opts.cidBase })}`
    }

    const path = rest.join('/')
    const results = ipfs._ipld.resolve(cid, path)
    let value = cid
    let remainderPath = path

    for await (const result of results) {
      if (CID.isCID(result.value)) {
        value = result.value
        remainderPath = result.remainderPath
      }
    }

    return `/ipfs/${cidToString(value, { base: opts.cidBase })}${remainderPath ? '/' + remainderPath : ''}`
  }

  return (name, opts, cb) => {
    if (typeof opts === 'function') {
      cb = opts
      opts = {}
    }
    opts = opts || {}
    return nodeify(resolve(name, opts), cb)
  }
}
