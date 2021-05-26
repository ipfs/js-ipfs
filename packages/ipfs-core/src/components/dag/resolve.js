'use strict'

const CID = require('cids')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

/**
 * @param {Object} config
 * @param {import('ipld')} config.ipld
 * @param {import('../../types').Preload} config.preload
 */
module.exports = ({ ipld, preload }) => {
  /**
   * @type {import('ipfs-core-types/src/dag').API["resolve"]}
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
