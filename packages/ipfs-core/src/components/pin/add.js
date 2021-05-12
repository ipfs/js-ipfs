'use strict'

const last = require('it-last')
const CID = require('cids')

/**
 * @param {Object} config
 * @param {ReturnType<typeof import('./add-all')>} config.addAll
 */
module.exports = ({ addAll }) =>
  /**
   * @type {import('ipfs-core-types/src/pin').API["add"]}
   */
  (path, options = {}) => {
    let iter

    if (CID.isCID(path)) {
      iter = addAll([{
        cid: path,
        ...options
      }], options)
    } else {
      iter = addAll([{
        path: path.toString(),
        ...options
      }], options)
    }

    // @ts-ignore return value of last can be undefined
    return last(iter)
  }
