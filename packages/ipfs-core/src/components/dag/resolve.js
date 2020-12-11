'use strict'

const CID = require('cids')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('.').IPLD} config.ipld
 * @param {import('.').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * Returns the CID and remaining path of the node at the end of the passed IPFS path
   *
   * @param {CID|string} ipfsPath
   * @param {ResolveOptions & AbortOptions} options
   * @returns {Promise<ResolveResult>}
   * @example
   * ```JavaScript
   * // example obj
   * const obj = {
   *   a: 1,
   *   b: [1, 2, 3],
   *   c: {
   *     ca: [5, 6, 7],
   *     cb: 'foo'
   *   }
   * }
   *
   * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
   * console.log(cid.toString())
   * // bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq
   *
   * const result = await ipfs.dag.resolve(`${cid}/c/cb`)
   * console.log(result)
   * // Logs:
   * // {
   * //   cid: CID(bafyreicyer3d34cutdzlsbe2nqu5ye62mesuhwkcnl2ypdwpccrsecfmjq),
   * //   remainderPath: 'c/cb'
   * // }
   * ```
   */
  async function resolve (ipfsPath, options = {}) {
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (options.preload !== false) {
      preload(cid)
    }

    if (path) {
      options.path = path
    }

    let lastCid = cid
    let lastRemainderPath = options.path || ''

    if (lastRemainderPath.startsWith('/')) {
      lastRemainderPath = lastRemainderPath.substring(1)
    }

    if (options.path) {
      try {
        for await (const { value, remainderPath } of ipld.resolve(cid, options.path, {
          signal: options.signal
        })) {
          if (!CID.isCID(value)) {
            break
          }

          lastRemainderPath = remainderPath
          lastCid = value
        }
      } catch (err) {
        // TODO: add error codes to IPLD
        if (err.message.startsWith('Object has no property')) {
          err.message = `no link named "${lastRemainderPath.split('/')[0]}" under ${lastCid}`
          err.code = 'ERR_NO_LINK'
        }
        throw err
      }
    }

    return {
      cid: lastCid,
      remainderPath: lastRemainderPath || ''
    }
  }

  return withTimeoutOption(resolve)
}

/**
 * @typedef {Object} ResolveOptions
 * @property {string} [path] - If `ipfsPath` is a `CID`, you may pass a path here
 * @property {boolean} [preload]
 *
 * @typedef {Object} ResolveResult
 * @property {CID} cid - The last CID encountered during the traversal
 * @property {string} remainderPath - The path to the end of the IPFS path
 * inside the node referenced by the CID
 *
 * @typedef {import('.').AbortOptions} AbortOptions
 */
