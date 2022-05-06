import last from 'it-last'
import { normaliseInput } from 'ipfs-core-utils/files/normalise-input-single'

/**
 * @param {object} context
 * @param {import('ipfs-core-types/src/root').API<{}>["addAll"]} context.addAll
 */
export function createAdd ({ addAll }) {
  /**
   * @type {import('ipfs-core-types/src/root').API<{}>["add"]}
   */
  async function add (entry, options = {}) {
    // @ts-expect-error TODO: https://github.com/ipfs/js-ipfs/issues/3290
    const result = await last(addAll(normaliseInput(entry), options))
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
