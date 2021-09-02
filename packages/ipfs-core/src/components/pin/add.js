'use strict'

const last = require('it-last')
const { CID } = require('multiformats/cid')

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

    const cid = CID.asCID(path)

    if (cid) {
      iter = addAll([{
        cid,
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
