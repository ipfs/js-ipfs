'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const { normalizePath } = require('./utils')
const { Format } = require('./refs')
const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

module.exports = function (self) {
  return async function * refsAsyncIterator (ipfsPath, options) { // eslint-disable-line require-await
    options = options || {}

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

    const rawPaths = Array.isArray(ipfsPath) ? ipfsPath : [ipfsPath]
    const paths = rawPaths.map(p => getFullPath(self, p, options))

    for (const path of paths) {
      yield * refsStream(self, path, options)
    }
  }
}

function getFullPath (ipfs, ipfsPath, options) {
  // normalizePath() strips /ipfs/ off the front of the path so the CID will
  // be at the front of the path
  const path = normalizePath(ipfsPath)
  const pathComponents = path.split('/')
  const cid = pathComponents[0]
  if (!isIpfs.cid(cid)) {
    throw new Error(`Error resolving path '${path}': '${cid}' is not a valid CID`)
  }

  if (options.preload !== false) {
    ipfs._preload(cid)
  }

  return '/ipfs/' + path
}

// Get a stream of refs at the given path
async function * refsStream (ipfs, path, options) {
  // Resolve to the target CID of the path
  const resPath = await ipfs.resolve(path)
  // path is /ipfs/<cid>
  const parts = resPath.split('/')
  const cid = parts[2]

  // Traverse the DAG, converting it into a stream
  for await (const obj of objectStream(ipfs, cid, options.maxDepth, options.unique)) {
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
async function * objectStream (ipfs, rootCid, maxDepth, isUnique) {
  const uniques = new Set()

  async function * traverseLevel (obj) {
    const { node, depth } = obj

    // Check the depth
    const nextLevelDepth = depth + 1
    if (nextLevelDepth > maxDepth) {
      return
    }

    // If unique option is enabled, check if the CID has been seen before.
    // Note we need to do this here rather than before adding to the stream
    // so that the unique check happens in the order that items are examined
    // in the DAG.
    if (isUnique) {
      if (uniques.has(node.cid.toString())) {
        // Mark this object as a duplicate so we can filter it out later
        obj.isDuplicate = true
        return
      }
      uniques.add(node.cid.toString())
    }

    // Get this object's links
    try {
      // Add to the stream each link, parent and the new depth
      for (const link of await getLinks(ipfs, node.cid)) {
        const child = {
          parent: node,
          node: link,
          depth: nextLevelDepth
        }

        yield child
        yield * await traverseLevel(child)
      }
    } catch (err) {
      if (err.code === ERR_NOT_FOUND) {
        err.message = `Could not find object with CID: ${node.cid}`
      }

      throw err
    }
  }

  yield * await traverseLevel({ node: { cid: rootCid }, depth: 0 })
}

// Fetch a node from IPLD then get all its links
async function getLinks (ipfs, cid) {
  const node = await ipfs._ipld.get(new CID(cid))

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
