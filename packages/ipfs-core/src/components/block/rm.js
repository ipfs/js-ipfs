import errCode from 'err-code'
import parallel from 'it-parallel'
import map from 'it-map'
import filter from 'it-filter'
import { pipe } from 'it-pipe'
import { cleanCid } from './utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const BLOCK_RM_CONCURRENCY = 8

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 */
export function createRm ({ repo }) {
  /**
   * @type {import('ipfs-core-types/src/block').API<{}>["rm"]}
   */
  async function * rm (cids, options = {}) {
    if (!Array.isArray(cids)) {
      cids = [cids]
    }

    // We need to take a write lock here to ensure that adding and removing
    // blocks are exclusive operations
    const release = await repo.gcLock.writeLock()

    try {
      yield * pipe(
        cids,
        source => map(source, cid => {
          return async () => {
            cid = cleanCid(cid)

            /** @type {import('ipfs-core-types/src/block').RmResult} */
            const result = { cid }

            try {
              const has = await repo.blocks.has(cid)

              if (!has) {
                throw errCode(new Error('block not found'), 'ERR_BLOCK_NOT_FOUND')
              }

              await repo.blocks.delete(cid)
            } catch (/** @type {any} */ err) {
              if (!options.force) {
                err.message = `cannot remove ${cid}: ${err.message}`
                result.error = err
              }
            }

            return result
          }
        }),
        source => parallel(source, { concurrency: BLOCK_RM_CONCURRENCY }),
        source => filter(source, () => !options.quiet)
      )
    } finally {
      release()
    }
  }

  return withTimeoutOption(rm)
}
