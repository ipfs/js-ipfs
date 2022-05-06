import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('../../types').NetworkService} config.network
 */
export function createWantlist ({ network }) {
  /**
   * @type {import('ipfs-core-types/src/bitswap').API<{}>["wantlist"]}
   */
  async function wantlist (options = {}) {
    const { bitswap } = await network.use(options)
    const list = bitswap.getWantlist()

    return Array.from(list).map(e => e[1].cid)
  }

  return withTimeoutOption(wantlist)
}
