import { CID } from 'multiformats/cid'
import { createUnsafe } from 'multiformats/block'
import { CarWriter } from '@ipld/car/writer'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import { logger } from '@libp2p/logger'
import * as raw from 'multiformats/codecs/raw'
import * as json from 'multiformats/codecs/json'
import { walk } from 'multiformats/traversal'

const log = logger('ipfs:components:dag:import')

// blocks that we're OK with not inspecting for links
/** @type {number[]} */
const NO_LINKS_CODECS = [
  raw.code, // raw
  json.code // JSON
]

/**
 * @typedef {import('../../types').Preload} Preload
 * @typedef {import('ipfs-repo').IPFSRepo} IPFSRepo
 * @typedef {import('@ipld/car/api').BlockWriter} BlockWriter
 * @typedef {import('ipfs-core-types/src/utils').AbortOptions} AbortOptions
 */

/**
 * @template T
 * @typedef {import('multiformats/block').Block<T>} Block
 */

/**
 * @param {object} config
 * @param {IPFSRepo} config.repo
 * @param {Preload} config.preload
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} config.codecs
 */
export function createExport ({ repo, preload, codecs }) {
  /**
   * @type {import('ipfs-core-types/src/dag').API<{}>["export"]}
   */
  async function * dagExport (root, options = {}) {
    if (options.preload !== false) {
      preload(root)
    }

    const cid = CID.asCID(root)
    if (!cid) {
      throw new Error(`Unexpected error converting CID type: ${root}`)
    }

    log(`Exporting ${cid} as car`)
    const { writer, out } = await CarWriter.create([cid])

    // we need to write with one async channel and send the CarWriter output
    // with another to the caller, but if the write causes an error we capture
    // that and make sure it gets propagated
    /** @type {Error|null} */
    let err = null
    ;(async () => {
      try {
        const load = makeLoader(repo, writer, {
          signal: options.signal,
          timeout: options.timeout
        }, codecs)
        await walk({ cid, load })
      } catch (/** @type {any} */ e) {
        err = e
      } finally {
        writer.close()
      }
    })()

    for await (const chunk of out) {
      if (err) {
        break
      }
      yield chunk
    }
    if (err) {
      throw err
    }
  }

  return withTimeoutOption(dagExport)
}

/**
 * @template T
 * @param {IPFSRepo} repo
 * @param {BlockWriter} writer
 * @param {AbortOptions} options
 * @param {import('ipfs-core-utils/multicodecs').Multicodecs} codecs
 * @returns {(cid:CID)=>Promise<Block<T>|null>}
 */
function makeLoader (repo, writer, options, codecs) {
  return async (cid) => {
    const codec = await codecs.getCodec(cid.code)

    if (!codec) {
      throw new Error(`Can't decode links in block with codec 0x${cid.code.toString(16)} to form complete DAG`)
    }

    const bytes = await repo.blocks.get(cid, options)

    log(`Adding block ${cid} to car`)
    await writer.put({ cid, bytes })

    if (NO_LINKS_CODECS.includes(cid.code)) {
      return null // skip this block, no need to look inside
    }

    return createUnsafe({ bytes, cid, codec })
  }
}
