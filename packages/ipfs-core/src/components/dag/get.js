import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import first from 'it-first'
import last from 'it-last'
import { resolve } from '../../utils.js'
import errCode from 'err-code'

/**
 * @param {object} config
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('../../types').Preload} config.preload
 */
export function createGet ({ codecs, repo, preload }) {
  /**
   * @type {import('ipfs-core-types/src/dag').API<{}>["get"]}
   */
  const get = async function get (cid, options = {}) {
    if (options.preload !== false) {
      preload(cid)
    }

    if (options.path) {
      const entry = options.localResolve
        ? await first(resolve(cid, options.path, codecs, repo, options))
        : await last(resolve(cid, options.path, codecs, repo, options))
      /** @type {import('ipfs-core-types/src/dag').GetResult | undefined} - first and last will return undefined when empty */
      const result = (entry)

      if (!result) {
        throw errCode(new Error('Not found'), 'ERR_NOT_FOUND')
      }

      return result
    }

    const codec = await codecs.getCodec(cid.code)
    const block = await repo.blocks.get(cid, options)
    const node = codec.decode(block)

    return {
      value: node,
      remainderPath: ''
    }
  }

  return withTimeoutOption(get)
}
