'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { cidToString } = require('../../utils/cid')

/**
 * @typedef {Object} ResolveOptions
 * @prop {string} cidBase - Multibase codec name the CID in the resolved path will be encoded with
 * @prop {boolean} [recursive=true] - Resolve until the result is an IPFS name
 *
 */

/** @typedef {(path: string, options?: ResolveOptions) => Promise<string>} Resolve */

/**
 * IPFS Resolve factory
 *
 * @param {Object} config
 * @param {IPLD} config.ipld - An instance of IPLD
 * @param {NameApi} [config.name] - An IPFS core interface name API
 * @returns {Resolve}
 */
module.exports = ({ ipld, name }) => {
  return async function resolve (path, opts) {
    opts = opts || {}

    if (!isIpfs.path(path)) {
      throw new Error('invalid argument ' + path)
    }

    if (isIpfs.ipnsPath(path)) {
      if (!name) {
        throw new Error('failed to resolve IPNS path: name API unavailable')
      }

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
