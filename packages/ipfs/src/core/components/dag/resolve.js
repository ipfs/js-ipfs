'use strict'

const CID = require('cids')
const { withTimeoutOption } = require('../../utils')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function resolve (ipfsPath, options = {}) {
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
  })
}
