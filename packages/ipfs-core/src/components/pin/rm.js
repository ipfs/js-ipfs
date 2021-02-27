'use strict'

const last = require('it-last')
const rmAll = require('./rm-all')

/**
 * @param {import('.').Context} context
 * @param {string|CID} path - CID or IPFS Path to unpin.
 * @param {import('ipfs-core-types/src/pin').RemoveOptions} [options]
 * @returns {Promise<CID>} - The CIDs that was unpinned
 */
const rm = async (context, path, options) =>
  /** @type {CID} - Need to loosen check here because it could be void */
  (await last(rmAll(context, { path, ...options }, options)))

/**
 * @typedef {RmSettings & AbortOptions} RmOptions
 *
 * @typedef {Object} RmSettings
 * @property {boolean} [recursive=true] - Recursively unpin the object linked
 *
 * @typedef {import('..').CID} CID
 * @typedef {import('../../utils').AbortOptions} AbortOptions
 */

module.exports = rm
