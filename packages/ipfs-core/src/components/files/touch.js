import mergeOpts from 'merge-options'
import { toMfsPath } from './utils/to-mfs-path.js'
import { logger } from '@libp2p/logger'
import errCode from 'err-code'
import { UnixFS } from 'ipfs-unixfs'
import { toTrail } from './utils/to-trail.js'
import { addLink } from './utils/add-link.js'
import { updateTree } from './utils/update-tree.js'
import { updateMfsRoot } from './utils/update-mfs-root.js'
import * as dagPB from '@ipld/dag-pb'
import { CID } from 'multiformats/cid'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:mfs:touch')

/**
 * @typedef {import('multiformats/cid').Version} CIDVersion
 * @typedef {import('ipfs-unixfs').MtimeLike} MtimeLike
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} flush
 * @property {number} shardSplitThreshold
 * @property {CIDVersion} cidVersion
 * @property {string} hashAlg
 * @property {MtimeLike} [mtime]
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  flush: true,
  shardSplitThreshold: 1000,
  cidVersion: 0,
  hashAlg: 'sha2-256'
}

/**
 * @param {MfsContext} context
 */
export function createTouch (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["touch"]}
   */
  async function mfsTouch (path, options = {}) {
    /** @type {DefaultOptions} */
    const settings = mergeOptions(defaultOptions, options)
    settings.mtime = settings.mtime || new Date()

    log(`Touching ${path} mtime: ${settings.mtime}`)

    const {
      cid,
      mfsDirectory,
      name,
      exists
    } = await toMfsPath(context, path, settings)

    const hashAlg = options.hashAlg || defaultOptions.hashAlg
    const hasher = await context.hashers.getHasher(hashAlg)

    let updatedBlock
    let updatedCid

    let cidVersion = settings.cidVersion

    if (!exists) {
      const metadata = new UnixFS({
        type: 'file',
        mtime: settings.mtime
      })
      updatedBlock = dagPB.encode({ Data: metadata.marshal(), Links: [] })

      const hash = await hasher.digest(updatedBlock)

      updatedCid = CID.create(settings.cidVersion, dagPB.code, hash)

      if (settings.flush) {
        await context.repo.blocks.put(updatedCid, updatedBlock)
      }
    } else {
      if (cid.code !== dagPB.code) {
        throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
      }

      cidVersion = cid.version

      const block = await context.repo.blocks.get(cid)
      const node = dagPB.decode(block)

      if (!node.Data) {
        throw errCode(new Error(`${path} had no data`), 'ERR_INVALID_NODE')
      }

      const metadata = UnixFS.unmarshal(node.Data)

      // @ts-expect-error TODO: restore setting all date types as mtime - it's in the code, just not the signature
      metadata.mtime = settings.mtime

      updatedBlock = dagPB.encode({
        Data: metadata.marshal(),
        Links: node.Links
      })

      const hash = await hasher.digest(updatedBlock)
      updatedCid = CID.create(settings.cidVersion, dagPB.code, hash)

      if (settings.flush) {
        await context.repo.blocks.put(updatedCid, updatedBlock)
      }
    }

    const trail = await toTrail(context, mfsDirectory)
    const parent = trail[trail.length - 1]
    const parentCid = parent.cid
    const parentBlock = await context.repo.blocks.get(parentCid)
    const parentNode = dagPB.decode(parentBlock)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: updatedBlock.length,
      flush: settings.flush,
      shardSplitThreshold: settings.shardSplitThreshold,
      hashAlg: settings.hashAlg,
      cidVersion
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, settings)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, settings)
  }

  return withTimeoutOption(mfsTouch)
}
