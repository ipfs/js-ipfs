'use strict'

const last = require('it-last')

/**
 * @param {Object} config
 * @param {import('ipfs-interface/src/root').AddAll} config.addAll
 */
module.exports = ({ addAll }) => {
  /** @type {import('ipfs-interface/src/root').Add} */
  async function add (entry, options) {
    /** @type {import('ipfs-interface/src/files').ImportSource} */
    const source = (entry) //
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
