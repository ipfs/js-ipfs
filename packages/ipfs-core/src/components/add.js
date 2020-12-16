'use strict'

const last = require('it-last')

/**
 * @typedef {Object} Context
 * @property {ReturnType<import('./add-all')>} addAll
 *
 * @param {Context} context
 */
module.exports = ({ addAll }) => {
  /**
   * Import a file or data into IPFS.
   *
   * @param {import('ipfs-core-types/src/files').ToEntry} entry
   * @param {import('ipfs-core-types/src/root').AddAllOptions} [options]
   * @returns {Promise<import('ipfs-core-types/src/files').UnixFSEntry>}
   */
  async function add (entry, options) {
    /** @type {import('ipfs-core-types/src/files').ImportSource} */
    const source = (entry)
    const result = await last(addAll(source, options))
    // Note this should never happen as `addAll` should yield at least one item
    // but to satisfy type checker we perfom this check and for good measure
    // throw an error in case it does happen.
    if (result == null) {
      throw Error('Failed to add a file, if you see this please report a bug')
    }

    return result
  }

  return add
}
