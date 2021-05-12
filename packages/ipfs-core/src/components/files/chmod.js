'use strict'

const mergeOptions = require('merge-options').bind({ ignoreUndefined: true })
const toMfsPath = require('./utils/to-mfs-path')
const log = require('debug')('ipfs:mfs:touch')
const errCode = require('err-code')
const { UnixFS } = require('ipfs-unixfs')
const toTrail = require('./utils/to-trail')
const addLink = require('./utils/add-link')
const updateTree = require('./utils/update-tree')
const updateMfsRoot = require('./utils/update-mfs-root')
const { DAGNode } = require('ipld-dag-pb')
const mc = require('multicodec')
const mh = require('multihashing-async').multihash
const { pipe } = require('it-pipe')
const { importer } = require('ipfs-unixfs-importer')
const { recursive } = require('ipfs-unixfs-exporter')
const last = require('it-last')
const cp = require('./cp')
const rm = require('./rm')
// @ts-ignore - TODO: refactor this so it does not require a deep require
const persist = require('ipfs-unixfs-importer/src/utils/persist')
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

/**
 * @typedef {import('multihashes').HashName} HashName
 * @typedef {import('cids').CIDVersion} CIDVersion
 * @typedef {import('./').MfsContext} MfsContext
 * @typedef {object} DefaultOptions
 * @property {boolean} flush
 * @property {HashName} hashAlg
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
      // @ts-ignore freaks out over the curr: number, acc: string thing
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
module.exports = (context) => {
  /**
   * @type {import('ipfs-core-types/src/files').API["chmod"]}
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

    if (cid.codec !== 'dag-pb') {
      throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
    }

    if (opts.recursive) {
      // recursively export from root CID, change perms of each entry then reimport
      // but do not reimport files, only manipulate dag-pb nodes
      const root = await pipe(
        async function * () {
          for await (const entry of recursive(cid, context.ipld)) {
            if (entry.type !== 'file' && entry.type !== 'directory') {
              throw errCode(new Error(`${path} was not a UnixFS node`), 'ERR_NOT_UNIXFS')
            }

            entry.unixfs.mode = calculateMode(mode, entry.unixfs)

            const node = new DAGNode(entry.unixfs.marshal(), entry.node.Links)

            yield {
              path: entry.path,
              content: node
            }
          }
        },
        // @ts-ignore source is not compatible because we are not importing files
        (source) => importer(source, context.block, {
          ...opts,
          pin: false,
          dagBuilder: async function * (source, block, opts) {
            for await (const entry of source) {
              yield async function () {
                /** @type {DAGNode} */
                // @ts-ignore - cannot derive type
                const node = entry.content

                const buf = node.serialize()
                const cid = await persist(buf, block, opts)
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
      await rm(context)(path, opts)

      // add newly created tree to mfs at path
      await cp(context)(`/ipfs/${root.cid}`, path, opts)

      return
    }

    let node = await context.ipld.get(cid)
    const metadata = UnixFS.unmarshal(node.Data)
    metadata.mode = calculateMode(mode, metadata)
    node = new DAGNode(metadata.marshal(), node.Links)

    /** @type {HashName} */
    const hashAlg = opts.hashAlg || defaultOptions.hashAlg

    const updatedCid = await context.ipld.put(node, mc.DAG_PB, {
      cidVersion: cid.version,
      hashAlg: mh.names[hashAlg],
      onlyHash: !opts.flush
    })

    const trail = await toTrail(context, mfsDirectory)
    const parent = trail[trail.length - 1]
    const parentNode = await context.ipld.get(parent.cid)

    const result = await addLink(context, {
      parent: parentNode,
      name: name,
      cid: updatedCid,
      size: node.serialize().length,
      flush: opts.flush,
      hashAlg: hashAlg,
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
