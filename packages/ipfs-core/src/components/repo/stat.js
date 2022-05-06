import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createStat ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/repo').API<{}>["stat"]}
   */
  async function stat (options = {}) {
    const stats = await repo.stat()

    return {
      numObjects: BigInt(stats.numObjects.toString()),
      repoSize: BigInt(stats.repoSize.toString()),
      repoPath: stats.repoPath,
      version: `${stats.version}`,
      storageMax: BigInt(stats.storageMax.toString())
    }
  }

  return withTimeoutOption(stat)
}
