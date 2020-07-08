'use strict'

const CID = require('cids')
const { withTimeoutOption } = require('../../utils')
const toCidAndPath = require('ipfs-core-utils/src/to-cid-and-path')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function resolve (cid, options = {}) {
    const {
      cid,
      path
    } = toCidAndPath(ipfsPath)

    if (options.preload !== false) {
      preload(cid)
    }

    let lastCid = cid
    let lastRemainderPath = path

    if (path) {
      for await (const { value, remainderPath } of ipld.resolve(cid, path, {
        signal: options.signal
      })) {
        if (!CID.isCID(value)) {
          break
        }

        lastRemainderPath = remainderPath
        lastCid = value
      }
    }

    return {
      value: lastCid,
      remainderPath: lastRemainderPath || ''
    }
  })
}
