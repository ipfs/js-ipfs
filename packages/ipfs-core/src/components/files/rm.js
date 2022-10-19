import errCode from 'err-code'
import { updateTree } from './utils/update-tree.js'
import { updateMfsRoot } from './utils/update-mfs-root.js'
import { removeLink } from './utils/remove-link.js'
import { toMfsPath } from './utils/to-mfs-path.js'
import { toTrail } from './utils/to-trail.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'
import mergeOpts from 'merge-options'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })

/**
 * @typedef {import('multiformats/cid').Version} CIDVersion
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} recursive
 * @property {CIDVersion} cidVersion
 * @property {string} hashAlg
 * @property {boolean} flush
 * @property {number} shardSplitThreshold
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  recursive: false,
  cidVersion: 0,
  hashAlg: 'sha2-256',
  flush: true,
  shardSplitThreshold: 1000
}

/**
 * @param {MfsContext} context
 */
export function createRm (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["rm"]}
   */
  async function mfsRm (paths, opts = {}) {
    /** @type {DefaultOptions} */
    const options = mergeOptions(defaultOptions, opts)

    if (!Array.isArray(paths)) {
      paths = [paths]
    }

    const sources = await Promise.all(
      paths.map(path => toMfsPath(context, path, options))
    )

    if (!sources.length) {
      throw errCode(new Error('Please supply at least one path to remove'), 'ERR_INVALID_PARAMS')
    }

    sources.forEach(source => {
      if (source.path === '/') {
        throw errCode(new Error('Cannot delete root'), 'ERR_INVALID_PARAMS')
      }
    })

    for (const source of sources) {
      await removePath(context, source.path, options)
    }
  }

  return withTimeoutOption(mfsRm)
}

/**
 * @param {MfsContext} context
 * @param {string} path
 * @param {DefaultOptions} options
 */
const removePath = async (context, path, options) => {
  const mfsPath = await toMfsPath(context, path, options)
  const trail = await toTrail(context, mfsPath.mfsPath)
  const child = trail[trail.length - 1]
  trail.pop()
  const parent = trail[trail.length - 1]

  if (!parent) {
    throw errCode(new Error(`${path} does not exist`), 'ERR_NOT_FOUND')
  }

  if (child.type === 'directory' && !options.recursive) {
    throw errCode(new Error(`${path} is a directory, use -r to remove directories`), 'ERR_WAS_DIR')
  }

  const {
    cid
  } = await removeLink(context, {
    parentCid: parent.cid,
    name: child.name,
    hashAlg: options.hashAlg,
    cidVersion: options.cidVersion,
    flush: options.flush,
    shardSplitThreshold: options.shardSplitThreshold
  })

  parent.cid = cid

  // update the tree with the new child
  const newRootCid = await updateTree(context, trail, options)

  // Update the MFS record with the new CID for the root of the tree
  await updateMfsRoot(context, newRootCid, options)
}
