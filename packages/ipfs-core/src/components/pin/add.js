'use strict'

const last = require('it-last')

/**
 * @param {Object} config
 * @param {ReturnType<typeof import('./add-all')>} config.addAll
 */
module.exports = ({ addAll }) =>
  /**
   * @param {CID|string} path
   * @param {AddOptions & AbortOptions} [options]
   * @returns {Promise<CID>}
   */
  async (path, options = {}) =>
    /** @type {CID} - Need to loosen check here because it could be void */
    (await last(addAll({ path, ...options }, options)))

/**
 * @typedef {Object} AddOptions
 * @property {boolean} [lock]
 * @property {boolean} [recursive] - Recursively pin all links contained by the object
 *
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 * @typedef {import('..').CID} CID
 */
