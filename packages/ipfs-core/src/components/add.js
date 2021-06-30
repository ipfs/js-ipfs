'use strict'

const last = require('it-last')

/**
 * @param {Object} context
 * @param {import('ipfs-core-types/src/root').API["addAll"]} context.addAll
 */
module.exports = ({ addAll }) => {
  /**
   * @type {import('ipfs-core-types/src/root').API["add"]}
   */
  async function add (entry, options = {}) {
    // @ts-ignore TODO: https://github.com/ipfs/js-ipfs/issues/3290
    const result = await last(addAll(entry, options))
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
