import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createUnwant ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/bitswap').API<{}>["unwant"]}
   */
  async function unwant (cids, options = {}) {
    const { bitswap } = await network.use(options)

    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    return bitswap.unwant(cids)
  }

  return withTimeoutOption(unwant)
}
