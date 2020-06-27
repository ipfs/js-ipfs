'use strict'

const CID = require('cids')
const { parseArgs } = require('./utils')
const { withTimeoutOption } = require('../../utils')

module.exports = ({ ipld, preload }) => {
  return withTimeoutOption(async function resolve (cid, path, options) {
    [cid, path, options] = parseArgs(cid, path, options)

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
