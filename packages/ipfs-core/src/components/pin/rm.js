import last from 'it-last'

/**
 * @param {object} config
 * @param {import('ipfs-core-types/src/pin').API<{}>["rmAll"]} config.rmAll
 */
export function createRm ({ rmAll }) {
  /**
   * @type {import('ipfs-core-types/src/pin').API<{}>["rm"]}
   */
  async function rm (path, options = {}) {
    // @ts-expect-error return value of last can be undefined
    const cid = await last(rmAll([{ path, ...options }], options))

    if (!cid) {
      throw new Error('CID expected')
    }

    return cid
  }

  return rm
}
