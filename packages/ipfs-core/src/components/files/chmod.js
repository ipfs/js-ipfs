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
import { pipe } from 'it-pipe'
import { importer } from 'ipfs-unixfs-importer'
import { recursive } from 'ipfs-unixfs-exporter'
import last from 'it-last'
import { createCp } from './cp.js'
import { createRm } from './rm.js'
import { persist } from './utils/persist.js'
import { withTimeoutOption } from 'ipfs-core-utils/with-timeout-option'

const mergeOptions = mergeOpts.bind({ ignoreUndefined: true })
const log = logger('ipfs:mfs:touch')

/**
 * @typedef {import('multiformats/cid').CIDVersion} CIDVersion
 * @typedef {import('@ipld/dag-pb').PBNode} PBNode
 * @typedef {import('./').MfsContext} MfsContext
 *
 * @typedef {object} DefaultOptions
 * @property {boolean} flush
 * @property {string} hashAlg
 * @property {CIDVersion} cidVersion
 * @property {number} shardSplitThreshold
 * @property {boolean} recursive
 * @property {AbortSignal} [signal]
 * @property {number} [timeout]
 */

/**
 * @type {DefaultOptions}
 */
const defaultOptions = {
  flush: true,
  shardSplitThreshold: 1000,
  hashAlg: 'sha2-256',
  cidVersion: 0,
  recursive: false
}

/**
 * @param {string} mode
 * @param {number} originalMode
 * @param {boolean} isDirectory
 */
function calculateModification (mode, originalMode, isDirectory) {
  let modification = 0

  if (mode.includes('x') || (mode.includes('X') && (isDirectory || (originalMode & 0o1 || originalMode & 0o10 || originalMode & 0o100)))) {
    modification += 1
  }

  if (mode.includes('w')) {
    modification += 2
  }

  if (mode.includes('r')) {
    modification += 4
  }

  return modification
}

/**
 * @param {string} references
 * @param {number} modification
 */
function calculateUGO (references, modification) {
  let ugo = 0

  if (references.includes('u')) {
    ugo += (modification << 6)
  }

  if (references.includes('g')) {
    ugo += (modification << 3)
  }

  if (references.includes('o')) {
    ugo += (modification)
  }

  return ugo
}

/**
 * @param {string} references
 * @param {string} mode
 * @param {number} modification
 */
function calculateSpecial (references, mode, modification) {
  if (mode.includes('t')) {
    modification += parseInt('1000', 8)
  }

  if (mode.includes('s')) {
    if (references.includes('u')) {
      modification += parseInt('4000', 8)
    }

    if (references.includes('g')) {
      modification += parseInt('2000', 8)
    }
  }

  return modification
}

/**
 * https://en.wikipedia.org/wiki/Chmod#Symbolic_modes
 *
 * @param {string} input
 * @param {number} originalMode
 * @param {boolean} isDirectory
 */
function parseSymbolicMode (input, originalMode, isDirectory) {
  if (!originalMode) {
    originalMode = 0
  }

  const match = input.match(/^(u?g?o?a?)(-?\+?=?)?(r?w?x?X?s?t?)$/)

  if (!match) {
    throw new Error(`Invalid file mode: ${input}`)
  }

  let [
    ,
    references,
    operator,
    mode
  ] = match

  if (references === 'a' || !references) {
    references = 'ugo'
  }

  let modification = calculateModification(mode, originalMode, isDirectory)
  modification = calculateUGO(references, modification)
  modification = calculateSpecial(references, mode, modification)

  if (operator === '=') {
    if (references.includes('u')) {
      // blank u bits
      originalMode = originalMode & parseInt('7077', 8)

      // or them together
      originalMode = originalMode | modification
    }

    if (references.includes('g')) {
      // blank g bits
      originalMode = originalMode & parseInt('7707', 8)

      // or them together
      originalMode = originalMode | modification
    }

    if (references.includes('o')) {
      // blank o bits
      originalMode = originalMode & parseInt('7770', 8)

      // or them together
      originalMode = originalMode | modification
    }

    return originalMode
  }

  if (operator === '+') {
    return modification | originalMode
  }

  if (operator === '-') {
    return modification ^ originalMode
  }

  return originalMode
}

/**
 * @param {string | InstanceType<typeof window.String> | number} mode
 * @param {UnixFS} metadata
 * @returns {number}
 */
function calculateMode (mode, metadata) {
  if (mode instanceof String || typeof mode === 'string') {
    const strMode = `${mode}`

    if (strMode.match(/^\d+$/g)) {
      mode = parseInt(strMode, 8)
    } else {
      mode = 0 + strMode.split(',').reduce((curr, acc) => {
        return parseSymbolicMode(acc, curr, metadata.isDirectory())
      }, metadata.mode || 0)
    }
  }

  return mode
}

/**
 * @param {MfsContext} context
 */
export function createChmod (context) {
  /**
   * @type {import('ipfs-core-types/src/files').API<{}>["chmod"]}
   */
  async function mfsChmod (path, mode, options = {}) {
    /** @type {DefaultOptions} */
    const opts = mergeOptions(defaultOptions, options)

    log(`Fetching stats for ${path}`)

    const {
      cid,
      mfsDirectory,
      name
    } = await toMfsPath(context, path, opts)

    if (cid.code !== dagPB.code) {
      throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
    }

    if (opts.recursive) {
      // recursively export from root CID, change perms of each entry then reimport
      // but do not reimport files, only manipulate dag-pb nodes
      const root = await pipe(
        async function * () {
          for await (const entry of recursive(cid, context.repo.blocks)) {
            if (entry.type !== 'file' && entry.type !== 'directory') {
              throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
            }

            entry.unixfs.mode = calculateMode(mode, entry.unixfs)

            const node = dagPB.prepare({
              Data: entry.unixfs.marshal(),
              Links: entry.node.Links
            })

            yield {
              path: entry.path,
              content: node
            }
          }
        },
        // @ts-expect-error we account for the incompatible source type with our custom dag builder below
        (source) => importer(source, context.repo.blocks, {
          ...opts,
          pin: false,
          dagBuilder: async function * (source, block, opts) {
            for await (const entry of source) {
              yield async function () {
                /** @type {PBNode} */
                // @ts-expect-error - cannot derive type
                const node = entry.content

                const buf = dagPB.encode(node)
                const cid = await persist(buf, block, opts)

                if (!node.Data) {
                  throw errCode(new Error(`${cid} had no data`), 'ERR_INVALID_NODE')
                }

                const unixfs = UnixFS.unmarshal(node.Data)

                return {
                  cid,
                  size: buf.length,
                  path: entry.path,
                  unixfs
                }
              }
            }
          }
        }),
        (nodes) => last(nodes)
      )

      if (!root) {
        throw errCode(new Error(`Could not chmod ${path}`), 'ERR_COULD_NOT_CHMOD')
      }

      // remove old path from mfs
      await createRm(context)(path, opts)

      // add newly created tree to mfs at path
      await createCp(context)(`/ipfs/${root.cid}`, path, opts)

      return
    }

    const block = await context.repo.blocks.get(cid)
    const node = dagPB.decode(block)

    if (!node.Data) {
      throw errCode(new Error(`${cid} had no data`), 'ERR_INVALID_NODE')
    }

    const metadata = UnixFS.unmarshal(node.Data)
    metadata.mode = calculateMode(mode, metadata)
    const updatedBlock = dagPB.encode({
      Data: metadata.marshal(),
      Links: node.Links
    })

    const hashAlg = opts.hashAlg || defaultOptions.hashAlg
    const hasher = await context.hashers.getHasher(hashAlg)
    const hash = await hasher.digest(updatedBlock)
    const updatedCid = CID.create(opts.cidVersion, dagPB.code, hash)

    if (opts.flush) {
      await context.repo.blocks.put(updatedCid, updatedBlock)
    }

    const trail = await toTrail(context, mfsDirectory)
    const parent = trail[trail.length - 1]
    const parentCid = CID.decode(parent.cid.bytes)
    const parentBlock = await context.repo.blocks.get(parentCid)
    const parentNode = dagPB.decode(parentBlock)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: updatedBlock.length,
      flush: opts.flush,
      // TODO vmx 2021-03-29: decide on the API, whether it should be a `hashAlg` or `hasher`
      hashAlg,
      cidVersion: cid.version,
      shardSplitThreshold: Infinity
    })

    parent.cid = result.cid

    // update the tree with the new child
    const newRootCid = await updateTree(context, trail, opts)

    // Update the MFS record with the new CID for the root of the tree
    await updateMfsRoot(context, newRootCid, opts)
  }

  return withTimeoutOption(mfsChmod)
}
