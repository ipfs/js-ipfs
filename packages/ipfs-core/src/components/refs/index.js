'use strict'

const { CID } = require('multiformats/cid')
// @ts-ignore
const { decode } = require('@ipld/dag-pb')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCIDAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const LegacyCID = require('cids')
const asLegacyCid = require('ipfs-core-utils/src/as-legacy-cid')

const Format = {
  default: '<dst>',
  edges: '<src> -> <dst>'
}

/**
 * @typedef {import('../../types').PbNode} PbNode
 *
 * @typedef {object} Node
 * @property {string} [name]
 * @property {LegacyCID} cid
 *
 * @typedef {object} TraversalResult
 * @property {Node} parent
 * @property {Node} node
 * @property {boolean} isDuplicate
 */

/**
 * @param {Object} config
 * @param {import('../../block-storage')} config.blockStorage
 * @param {import('ipfs-core-types/src/root').API["resolve"]} config.resolve
 * @param {import('../../types').Preload} config.preload
 */
module.exports = function ({ blockStorage, resolve, preload }) {
  /**
   * @type {import('ipfs-core-types/src/refs').API["refs"]}
   */
  async function * refs (ipfsPath, options = {}) {
    if (options.maxDepth === 0) {
      return
    }

    if (options.edges && options.format && options.format !== Format.default) {
      throw new Error('Cannot set edges to true and also specify format')
    }

    options.format = options.edges ? Format.edges : options.format

    if (typeof options.maxDepth !== 'number') {
      options.maxDepth = options.recursive ? Infinity : 1
    }

    /** @type {(string|LegacyCID)[]} */
    const rawPaths = Array.isArray(ipfsPath) ? ipfsPath : [ipfsPath]

    const paths = rawPaths.map(p => getFullPath(preload, p, options))

    for (const path of paths) {
      yield * refsStream(resolve, blockStorage, path, options)
    }
  }

  return withTimeoutOption(refs)
}

module.exports.Format = Format

/**
 * @param {import('../../types').Preload} preload
 * @param {string | LegacyCID} ipfsPath
 * @param {import('ipfs-core-types/src/refs').RefsOptions} options
 */
function getFullPath (preload, ipfsPath, options) {
  const {
    cid,
    path
  } = toCIDAndPath(ipfsPath)

  if (options.preload !== false) {
    preload(cid)
  }

  return `/ipfs/${cid}${path || ''}`
}

/**
 * Get a stream of refs at the given path
 *
 * @param {import('ipfs-core-types/src/root').API["resolve"]} resolve
 * @param {import('../../block-storage')} blockStorage
 * @param {string} path
 * @param {import('ipfs-core-types/src/refs').RefsOptions} options
 */
async function * refsStream (resolve, blockStorage, path, options) {
  // Resolve to the target CID of the path
  const resPath = await resolve(path)
  const {
    cid
  } = toCIDAndPath(resPath)

  const maxDepth = options.maxDepth != null ? options.maxDepth : Infinity
  const unique = options.unique || false

  // Traverse the DAG, converting it into a stream
  for await (const obj of objectStream(blockStorage, cid, maxDepth, unique)) {
    // Root object will not have a parent
    if (!obj.parent) {
      continue
    }

    // Filter out duplicates (isDuplicate flag is only set if options.unique is set)
    if (obj.isDuplicate) {
      continue
    }

    // Format the links
    // Clients expect refs to be in the format { ref: <ref> }
    yield {
      ref: formatLink(obj.parent.cid, obj.node.cid, obj.node.name, options.format)
    }
  }
}

/**
 * Get formatted link
 *
 * @param {LegacyCID} srcCid
 * @param {LegacyCID} dstCid
 * @param {string} [linkName]
 * @param {string} [format]
 */
function formatLink (srcCid, dstCid, linkName = '', format = Format.default) {
  let out = format.replace(/<src>/g, srcCid.toString())
  out = out.replace(/<dst>/g, dstCid.toString())
  out = out.replace(/<linkname>/g, linkName)
  return out
}

/**
 * Do a depth first search of the DAG, starting from the given root cid
 *
 * @param {import('../../block-storage')} blockStorage
 * @param {LegacyCID} rootCid
 * @param {number} maxDepth
 * @param {boolean} uniqueOnly
 */
async function * objectStream (blockStorage, rootCid, maxDepth, uniqueOnly) { // eslint-disable-line require-await
  const seen = new Set()

  /**
   * @param {Node} parent
   * @param {number} depth
   * @returns {AsyncGenerator<TraversalResult, void, undefined>}
   */
  async function * traverseLevel (parent, depth) {
    const nextLevelDepth = depth + 1

    // Check the depth
    if (nextLevelDepth > maxDepth) {
      return
    }

    // Get this object's links
    try {
      // Look at each link, parent and the new depth
      for (const link of await getLinks(blockStorage, parent.cid)) {
        yield {
          parent: parent,
          node: link,
          isDuplicate: uniqueOnly && seen.has(link.cid.toString())
        }

        if (uniqueOnly) {
          seen.add(link.cid.toString())
        }

        yield * traverseLevel(link, nextLevelDepth)
      }
    } catch (err) {
      if (err.code === ERR_NOT_FOUND) {
        err.message = `Could not find object with CID: ${parent.cid}`
      }

      throw err
    }
  }

  yield * traverseLevel({ cid: rootCid }, 0)
}

// TODO vmx 2021-03-18: Use multiformats `links()` from its block interface instead
/**
 * Fetch a node and then get all its links
 *
 * @param {import('../../block-storage')} blockStorage
 * @param {LegacyCID} cid
 */
async function getLinks (blockStorage, cid) {
  const block = await blockStorage.get(CID.decode(cid.bytes))
  /** @type {PbNode} */
  const node = decode(block.bytes)
  // TODO vmx 2021-03-18: Add support for non DAG-PB nodes. this is what `getNodeLinks()` does
  // return getNodeLinks(node)
  return node.Links.map(({ Name, Hash }) => ({ name: Name, cid: asLegacyCid(Hash) }))
}

///**
// * Recursively search the node for CIDs
// *
// * @param {object} node
// * @param {string} [path]
// * @returns {Node[]}
// */
//function getNodeLinks (node, path = '') {
//  /** @type {Node[]} */
//  let links = []
//  for (const [name, value] of Object.entries(node)) {
//    const cid = CID.asCID(value)
//    if (cid) {
//      links.push({
//        name: path + name,
//        cid
//      })
//    } else if (typeof value === 'object') {
//      links = links.concat(getNodeLinks(value, path + name + '/'))
//    }
//  }
//  return links
//}
