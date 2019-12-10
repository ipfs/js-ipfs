'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
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
module.exports = ({ name, ipld }) => {
  /**
   * IPFS Resolve - Resolve the value of names to IPFS
   *
   * @param {String} path
   * @param {ResolveOptions} [opts={}]
   * @returns {Promise<string>}
   */
  return async function resolve (path, opts) {
    opts = opts || {}

    if (!isIpfs.path(path)) {
      throw new Error('invalid argument ' + path)
    }

    if (isIpfs.ipnsPath(path)) {
      for await (const resolvedPath of name.resolve(path, opts)) {
        path = resolvedPath
      }
    }

    const [, , hash, ...rest] = path.split('/') // ['', 'ipfs', 'hash', ...path]
    const cid = new CID(hash)

    // nothing to resolve return the input
    if (rest.length === 0) {
      return `/ipfs/${cidToString(cid, { base: opts.cidBase })}`
    }

    path = rest.join('/')

    const results = ipld.resolve(cid, path)
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
}
