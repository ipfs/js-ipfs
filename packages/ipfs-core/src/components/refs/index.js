'use strict'

const dagPb = require('@ipld/dag-pb')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')
const toCIDAndPath = require('ipfs-core-utils/src/to-cid-and-path')
const { CID } = require('multiformats/cid')

const Format = {
  default: '<dst>',
  edges: '<src> -> <dst>'
}

/**
 * @typedef {object} Node
 * @property {string} [name]
 * @property {CID} cid
 *
 * @typedef {object} TraversalResult
 * @property {Node} parent
 * @property {Node} node
 * @property {boolean} isDuplicate
 */

/**
 * @param {Object} config
 * @param {import('ipfs-repo').IPFSRepo} config.repo
 * @param {import('ipfs-core-utils/src/multicodecs')} config.codecs
 * @param {import('ipfs-core-types/src/root').API["resolve"]} config.resolve
 * @param {import('../../types').Preload} config.preload
 */
module.exports = function ({ repo, codecs, resolve, preload }) {
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

    /** @type {(string|CID)[]} */
    const rawPaths = Array.isArray(ipfsPath) ? ipfsPath : [ipfsPath]

    const paths = rawPaths.map(p => getFullPath(preload, p, options))

    for (const path of paths) {
      yield * refsStream(resolve, repo, codecs, path, options)
    }
  }

  return withTimeoutOption(refs)
}

module.exports.Format = Format

/**
 * @param {import('../../types').Preload} preload
 * @param {string | CID} ipfsPath
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
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {string} path
 * @param {import('ipfs-core-types/src/refs').RefsOptions} options
 */
async function * refsStream (resolve, repo, codecs, path, options) {
  // Resolve to the target CID of the path
  const resPath = await resolve(path)
  const {
    cid
  } = toCIDAndPath(resPath)

  const maxDepth = options.maxDepth != null ? options.maxDepth : Infinity
  const unique = options.unique || false

  // Traverse the DAG, converting it into a stream
  for await (const obj of objectStream(repo, codecs, cid, maxDepth, unique)) {
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
 * @param {CID} srcCid
 * @param {CID} dstCid
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
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {CID} rootCid
 * @param {number} maxDepth
 * @param {boolean} uniqueOnly
 */
async function * objectStream (repo, codecs, rootCid, maxDepth, uniqueOnly) { // eslint-disable-line require-await
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
      for await (const link of getLinks(repo, codecs, parent.cid)) {
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

/**
 * Fetch a node and then get all its links
 *
 * @param {import('ipfs-repo').IPFSRepo} repo
 * @param {import('ipfs-core-utils/src/multicodecs')} codecs
 * @param {CID} cid
 * @param {Array<string|number>} base
 * @returns {AsyncGenerator<{ name: string, cid: CID }, void, undefined>}
 */
async function * getLinks (repo, codecs, cid, base = []) {
  const block = await repo.blocks.get(cid)
  const codec = await codecs.getCodec(cid.code)
  const value = codec.decode(block)
  const isDagPb = cid.code === dagPb.code

  for (const [name, cid] of links(value, base)) {
    // special case for dag-pb - use the name of the link
    // instead of the path within the object
    if (isDagPb) {
      const match = name.match(/^Links\/(\d+)\/Hash$/)

      if (match) {
        const index = Number(match[1])

        if (index < value.Links.length) {
          yield {
            name: value.Links[index].Name,
            cid
          }

          continue
        }
      }
    }

    yield {
      name,
      cid
    }
  }
}

/**
 * @param {*} source
 * @param {Array<string|number>} base
 * @returns {Iterable<[string, CID]>}
 */
const links = function * (source, base) {
  if (source == null) {
    return
  }

  if (source instanceof Uint8Array) {
    return
  }

  for (const [key, value] of Object.entries(source)) {
    const path = [...base, key]

    if (value != null && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const [index, element] of value.entries()) {
          const elementPath = [...path, index]
          const cid = CID.asCID(element)

          // eslint-disable-next-line max-depth
          if (cid) {
            yield [elementPath.join('/'), cid]
          } else if (typeof element === 'object') {
            yield * links(element, elementPath)
          }
        }
      } else {
        const cid = CID.asCID(value)

        if (cid) {
          yield [path.join('/'), cid]
        } else {
          yield * links(value, path)
        }
      }
    }
  }

  // ts requires a @returns annotation when a function is recursive,
  // eslint requires a return when you use a @returns annotation.
  return []
}
