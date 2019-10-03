'use strict'

const pull = require('pull-stream')
const pullDefer = require('pull-defer')
const pullTraverse = require('pull-traverse')
const pullCat = require('pull-cat')
const isIpfs = require('is-ipfs')
const CID = require('cids')
const { DAGNode } = require('ipld-dag-pb')
const { normalizePath } = require('./utils')
const { Format } = require('./refs')

const { Errors } = require('interface-datastore')
const ERR_NOT_FOUND = Errors.notFoundError().code

module.exports = function (self) {
  return function (ipfsPath, options) {
    options = options || {}

    if (options.maxDepth === 0) {
      return pull.empty()
    }
    if (options.edges && options.format && options.format !== Format.default) {
      return pull.error(new Error('Cannot set edges to true and also specify format'))
    }

    options.format = options.edges ? Format.edges : options.format || Format.default

    if (typeof options.maxDepth !== 'number') {
      options.maxDepth = options.recursive ? Infinity : 1
    }

    let paths
    try {
      const rawPaths = Array.isArray(ipfsPath) ? ipfsPath : [ipfsPath]
      paths = rawPaths.map(p => getFullPath(self, p, options))
    } catch (err) {
      return pull.error(err)
    }

    return pullCat(paths.map(p => refsStream(self, p, options)))
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
function refsStream (ipfs, path, options) {
  const deferred = pullDefer.source()

  // Resolve to the target CID of the path
  ipfs.resolve(path, (err, resPath) => {
    if (err) {
      return deferred.resolve(pull.error(err))
    }

    // path is /ipfs/<cid>
    const parts = resPath.split('/')
    const cid = parts[2]
    deferred.resolve(pull(
      // Traverse the DAG, converting it into a stream
      objectStream(ipfs, cid, options.maxDepth, options.unique),
      // Root object will not have a parent
      pull.filter(obj => Boolean(obj.parent)),
      // Filter out duplicates (isDuplicate flag is only set if options.unique is set)
      pull.filter(obj => !obj.isDuplicate),
      // Format the links
      pull.map(obj => formatLink(obj.parent.cid, obj.node.cid, obj.node.name, options.format)),
      // Clients expect refs to be in the format { ref: <ref> }
      pull.map(ref => ({ ref }))
    ))
  })

  return deferred
}

// Get formatted link
function formatLink (srcCid, dstCid, linkName, format) {
  let out = format.replace(/<src>/g, srcCid.toString())
  out = out.replace(/<dst>/g, dstCid.toString())
  out = out.replace(/<linkname>/g, linkName)
  return out
}

// Do a depth first search of the DAG, starting from the given root cid
function objectStream (ipfs, rootCid, maxDepth, isUnique) {
  const uniques = new Set()

  const root = { node: { cid: rootCid }, depth: 0 }
  const traverseLevel = (obj) => {
    const { node, depth } = obj

    // Check the depth
    const nextLevelDepth = depth + 1
    if (nextLevelDepth > maxDepth) {
      return pull.empty()
    }

    // If unique option is enabled, check if the CID has been seen before.
    // Note we need to do this here rather than before adding to the stream
    // so that the unique check happens in the order that items are examined
    // in the DAG.
    if (isUnique) {
      if (uniques.has(node.cid.toString())) {
        // Mark this object as a duplicate so we can filter it out later
        obj.isDuplicate = true
        return pull.empty()
      }
      uniques.add(node.cid.toString())
    }

    const deferred = pullDefer.source()

    // Get this object's links
    getLinks(ipfs, node.cid, (err, links) => {
      if (err) {
        if (err.code === ERR_NOT_FOUND) {
          err.message = `Could not find object with CID: ${node.cid}`
        }
        return deferred.resolve(pull.error(err))
      }

      // Add to the stream each link, parent and the new depth
      const vals = links.map(link => ({
        parent: node,
        node: link,
        depth: nextLevelDepth
      }))

      deferred.resolve(pull.values(vals))
    })

    return deferred
  }

  return pullTraverse.depthFirst(root, traverseLevel)
}

// Fetch a node from IPLD then get all its links
function getLinks (ipfs, cid, callback) {
  ipfs._ipld.get(new CID(cid))
    .then(node => {
      let links
      if (DAGNode.isDAGNode(node)) {
        links = node.Links.map(({ Name, Hash }) => {
          return { name: Name, cid: new CID(Hash) }
        })
      } else {
        links = getNodeLinks(node)
      }
      callback(null, links)
    })
    .catch(callback)
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
