import { normaliseInput } from 'ipfs-core-utils/pins/normalise-input'
import { resolvePath } from '../../utils.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { PinTypes } from 'ipfs-repo/pin-types'

/**
 * @param {object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 */
export function createRmAll ({ repo, codecs }) {
  /**
   * @type {import('ipfs-core-types/src/pin').API<{}>["rmAll"]}
   */
  async function * rmAll (source, _options = {}) {
    const release = await repo.gcLock.readLock()

    try {
      // verify that each hash can be unpinned
      for await (const { path, recursive } of normaliseInput(source)) {
        const { cid } = await resolvePath(repo, codecs, path)
        const { pinned, reason } = await repo.pins.isPinnedWithType(cid, PinTypes.all)

        if (!pinned) {
          throw new Error(`${cid} is not pinned`)
        }

        switch (reason) {
          case (PinTypes.recursive):
            if (!recursive) {
              throw new Error(`${cid} is pinned recursively`)
            }

            await repo.pins.unpin(cid)

            yield cid

            break
          case (PinTypes.direct):
            await repo.pins.unpin(cid)

            yield cid

            break
          default:
            throw new Error(`${cid} is pinned indirectly under ${reason}`)
        }
      }
    } finally {
      release()
    }
  }

  return withTimeoutOption(rmAll)
}
