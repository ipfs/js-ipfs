'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { cidToString } = require('../../utils/cid')
const { withTimeoutOption } = require('../utils')

/**
 * @typedef {object} ResolveOptions
 * @property {string} [cidBase='base58btc'] - Multibase codec name the CID in the resolved path will be encoded with
 * @property {boolean} [recursive=true] - Resolve until the result is an IPFS name
 */

/**
 * Resolve the value of names to IPFS
 *
 * There are a number of mutable name protocols that can link among themselves and into IPNS. For example IPNS references can (currently) point at an IPFS object, and DNS links can point at other DNS links, IPNS entries, or IPFS objects. This command accepts any of these identifiers and resolves them to the referenced item.
 *
 * @template {Record<string, any>} ExtraOptions
 * @callback Resolve
 * @param {string} path - The name to resolve
 * @param {ResolveOptions & import('../utils').AbortOptions & ExtraOptions} [options]
 * @returns {Promise<string>} - A string representing the resolved name
 */

/**
 * IPFS Resolve factory
 *
 * @param {object} config
 * @param {IPLD} config.ipld - An instance of IPLD
 * @param {NameApi} [config.name] - An IPFS core interface name API
 * @returns {Resolve<{}>}
 */
module.exports = ({ ipld, name }) => {
  return withTimeoutOption(async function resolve (path, opts) {
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
  })
}
