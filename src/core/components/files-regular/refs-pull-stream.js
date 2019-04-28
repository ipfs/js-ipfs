'use strict'

const pull = require('pull-stream')
const pullDefer = require('pull-defer')
const pullTraverse = require('pull-traverse')
const isIpfs = require('is-ipfs')
const { normalizePath } = require('./utils')
const { Format } = require('./refs')

module.exports = function (self) {
  return function (ipfsPath, options = {}) {
    setOptionsAlias(options, [
      ['recursive', 'r'],
      ['e', 'edges'],
      ['u', 'unique'],
      ['maxDepth', 'max-depth']
    ])

    if (options.maxDepth === 0) {
      return pull.empty()
    }
    if (options.e && options.format && options.format !== Format.default) {
      return pull.error(new Error('Cannot set edges to true and also specify format'))
    }

    options.format = options.e ? Format.edges : options.format || Format.default

    if (options.maxDepth === undefined) {
      options.maxDepth = options.recursive ? global.Infinity : 1
    }

    // normalizePath() strips /ipfs/ off the front of the path so the CID will
    // be at the front of the path
    const path = normalizePath(ipfsPath)
    const pathComponents = path.split('/')
    const cid = pathComponents[0]
    if (!isIpfs.cid(cid)) {
      return pull.error(new Error(`Error resolving path '${path}': '${cid}' is not a valid CID`))
    }

    if (options.preload !== false) {
      self._preload(cid)
    }

    const fullPath = '/ipfs/' + path
    return refsStream(self, fullPath, options)
  }
}

// Make sure the original name is set for each alias
function setOptionsAlias (options, aliases) {
  for (const alias of aliases) {
    if (options[alias[0]] === undefined) {
      options[alias[0]] = options[alias[1]]
    }
  }
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
      objectStream(ipfs, cid, options.maxDepth, options.u),
      // Root object will not have a parent
      pull.filter(obj => Boolean(obj.parent)),
      // Filter out duplicates (isDuplicate flag is only set if options.u is set)
      pull.filter(obj => !obj.isDuplicate),
      // Format the links
      pull.map(obj => formatLink(obj.parent.cid, obj.node.cid, obj.node.name, options.format)),
      // Clients expect refs to be in the format { Ref: ref }
      pull.map(ref => ({ Ref: ref }))
    ))
  })

  return deferred
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
    ipfs.object.links(node.cid, (err, links) => {
      if (err) {
        if (err.code === 'ERR_NOT_FOUND') {
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

// Get formatted link
function formatLink (srcCid, dstCid, linkName, format) {
  let out = format.replace(/<src>/g, srcCid.toString())
  out = out.replace(/<dst>/g, dstCid.toString())
  out = out.replace(/<linkname>/g, linkName)
  return out
}
