'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { cidToString } = require('ipfs-core-utils/src/cid')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Name} config.name - An IPFS core interface name API
 */
module.exports = ({ ipld, name }) => {
  /**
   * Resolve the value of names to IPFS
   *
   * There are a number of mutable name protocols that can link among themselves
   * and into IPNS. For example IPNS references can (currently) point at an IPFS
   * object, and DNS links can point at other DNS links, IPNS entries, or IPFS
   * objects. This command accepts any of these identifiers and resolves them
   * to the referenced item.
   *
   * @param {string} path - The name to resolve
   * @param {ResolveOptions} [opts]
   * @returns {Promise<string>} - A string representing the resolved name
   * @example
   * ```js
   * // Resolve the value of your identity:
   * const name = '/ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy'
   *
   * const res = await ipfs.resolve(name)
   * console.log(res)
   * // Logs: /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * // Resolve the value of another name recursively:
   * const name = '/ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n'
   *
   * // Where:
   * // /ipns/QmbCMUZw6JFeZ7Wp9jkzbye3Fzp2GGcPgC3nmeUjfVF87n
   * // ...resolves to:
   * // /ipns/QmatmE9msSfkKxoffpHwNLNKgwZG8eT9Bud6YoPab52vpy
   * // ...which in turn resolves to:
   * // /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * const res = await ipfs.resolve(name, { recursive: true })
   * console.log(res)
   * // Logs: /ipfs/Qmcqtw8FfrVSBaRmbWwHxt3AuySBhJLcvmFYi3Lbc4xnwj
   *
   * // Resolve the value of an IPFS path:
   * const name = '/ipfs/QmeZy1fGbwgVSrqbfh9fKQrAWgeyRnj7h8fsHS1oy3k99x/beep/boop'
   * const res = await ipfs.resolve(name)
   * console.log(res)
   * // Logs: /ipfs/QmYRMjyvAiHKN9UTi8Bzt1HUspmSRD8T8DwxfSMzLgBon1
   * ```
   */
  async function resolve (path, opts = {}) {
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

  return withTimeoutOption(resolve)
}

/**
 * @typedef {ResolveSettings & AbortOptions} ResolveOptions
 *
 * @typedef {Object} ResolveSettings
 * @property {boolean} [recursive=true] - Resolve until result is an IPFS name.
 * @property {import('cids').BaseNameOrCode} [cidBase='base58btc'] - Multibase codec name the CID in the resolved path will be encoded with.
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
