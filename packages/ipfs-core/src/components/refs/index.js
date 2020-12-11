'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const { normalizeCidPath } = require('../../utils')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code
const withTimeoutOption = require('ipfs-core-utils/src/with-timeout-option')

const Format = {
  default: '<dst>',
  edges: '<src> -> <dst>'
}

/**
 * @param {Object} config
 * @param {import('..').IPLD} config.ipld
 * @param {import('..').Resolve} config.resolve
 * @param {import('..').Preload} config.preload
 */
module.exports = function ({ ipld, resolve, preload }) {
  /**
   * Get links (references) from an object
   *
   * @param {CID|string} ipfsPath - The object to search for references
   * @param {RefsOptions & AbortOptions} [options]
   * @returns {AsyncIterable<RefResult>}
   */
  async function * refs (ipfsPath, options = {}) {
    if (options.maxDepth === 0) {
      return
    }

    if (options.edges && options.format && options.format !== Format.default) {
      throw new Error('Cannot set edges to true and also specify format')
    }

    options.format = options.edges ? Format.edges : options.format || Format.default

    if (typeof options.maxDepth !== 'number') {
      options.maxDepth = options.recursive ? Infinity : 1
    }

    /** @type {(string|CID)[]} */
    const rawPaths = Array.isArray(ipfsPath) ? ipfsPath : [ipfsPath]

    const paths = rawPaths.map(p => getFullPath(preload, p, options))

    for (const path of paths) {
      yield * refsStream(resolve, ipld, path, options)
    }
  }

  return withTimeoutOption(refs)
}

module.exports.Format = Format

function getFullPath (preload, ipfsPath, options) {
  // normalizeCidPath() strips /ipfs/ off the front of the path so the CID will
  // be at the front of the path
  const path = normalizeCidPath(ipfsPath)
  const pathComponents = path.split('/')
  const cid = pathComponents[0]

  if (!isIpfs.cid(cid)) {
    throw new Error(`Error resolving path '${path}': '${cid}' is not a valid CID`)
  }

  if (options.preload !== false) {
    preload(cid)
  }

  return '/ipfs/' + path
}

// Get a stream of refs at the given path
async function * refsStream (resolve, ipld, path, options) {
  // Resolve to the target CID of the path
  const resPath = await resolve(path)
  // path is /ipfs/<cid>
  const parts = resPath.split('/')
  const cid = parts[2]

  // Traverse the DAG, converting it into a stream
  for await (const obj of objectStream(ipld, cid, options.maxDepth, options.unique)) {
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

// Get formatted link
function formatLink (srcCid, dstCid, linkName, format) {
  let out = format.replace(/<src>/g, srcCid.toString())
  out = out.replace(/<dst>/g, dstCid.toString())
  out = out.replace(/<linkname>/g, linkName)
  return out
}

// Do a depth first search of the DAG, starting from the given root cid
async function * objectStream (ipld, rootCid, maxDepth, uniqueOnly) { // eslint-disable-line require-await
  const seen = new Set()

  async function * traverseLevel (parent, depth) {
    const nextLevelDepth = depth + 1

    // Check the depth
    if (nextLevelDepth > maxDepth) {
      return
    }

    // Get this object's links
    try {
      // Look at each link, parent and the new depth
      for (const link of await getLinks(ipld, parent.cid)) {
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

// Fetch a node from IPLD then get all its links
async function getLinks (ipld, cid) {
  const node = await ipld.get(new CID(cid))

  if (DAGNode.isDAGNode(node)) {
    return node.Links.map(({ Name, Hash }) => ({ name: Name, cid: new CID(Hash) }))
  }

  return getNodeLinks(node)
}

// Recursively search the node for CIDs
function getNodeLinks (node, path = '') {
  let links = []
  for (const [name, value] of Object.entries(node)) {
    if (CID.isCID(value)) {
      links.push({
        name: path + name,
        cid: value
      })
    } else if (typeof value === 'object') {
      links = links.concat(getNodeLinks(value, path + name + '/'))
    }
  }
  return links
}

/**
 * @typedef {Object} RefsOptions
 * @property {boolean} [recursive=false] - Recursively list references of child nodes
 * @property {boolean} [unique=false] - Omit duplicate references from output
 * @property {string} [format='<dst>'] - Output edges with given format. Available tokens: `<src>`, `<dst>`, `<linkname>`
 * @property {boolean} [edges=false] - output references in edge format: `"<src> -> <dst>"`
 * @property {number} [maxDepth=1] - only for recursive refs, limits fetch and listing to the given depth
 *
 * @typedef {{ref:string, err?:null}|{ref?:undefined, err:Error}} RefResult
 *
 * @typedef {import('..').AbortOptions} AbortOptions
 * @typedef {import('..').Repo} Repo
 */
