'use strict'

const last = require('it-last')

/**
 * @param {Object} config
 * @param {import('ipfs-core-types/src/pin').API["rmAll"]} config.rmAll
 */
module.exports = ({ rmAll }) =>
  /**
   * @type {import('ipfs-core-types/src/pin').API["rm"]}
   */
  (path, options = {}) => {
    // @ts-ignore return value of last can be undefined
    return last(rmAll([{ path, ...options }], options))
  }
