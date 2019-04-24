'use strict'

const exporter = require('ipfs-unixfs-exporter')
const pull = require('pull-stream')
const pullError = require('pull-stream/sources/error')
const pullDefer = require('pull-defer')
const { normalizePath } = require('./utils')
const { Format } = require('./refs')

module.exports = function (self) {
  return function (ipfsPath, options = {}) {
    if (options.maxDepth === 0) {
      return pull.empty()
    }
    if (options.format !== Format.default && options.e) {
      return pullError(Error('Cannot set edges to true and also specify format'))
    }

    options.format = options.e ? Format.edges : options.format || Format.default

    const path = normalizePath(ipfsPath)
    const pathComponents = path.split('/')

    // eg QmHash/linkName => 2
    const pathDepth = pathComponents.length

    // The exporter returns a depth for each node, eg:
    // Qmhash.../linkName/linkName/linkName/block
    //    0         1         2        3      4
    if (options.maxDepth === undefined) {
      options.maxDepth = options.recursive ? global.Infinity : pathDepth
    } else {
      options.maxDepth = options.maxDepth + pathDepth - 1
    }

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    // We need to collect all the values from the exporter and work out the
    // parent of each node, so use a deferred source.
    // TODO: It would be more efficient for the exporter to return the parent
    // cid with the node, so we could just stream the result back to the
    // client. Is this possible?
    const deferred = pullDefer.source()

    pull(
      // Stream the values from the exporter
      exporter(ipfsPath, self._ipld, options),
      // Get each node's hash as a string
      pull.map(node => {
        node.hash = node.cid.toString()
        return node
      }),
      // Collect the links
      pull.collect(function (err, links) {
        if (err) {
          return deferred.resolve(pullError(err))
        }

        if (!links.length) {
          return deferred.resolve(pull.values([]))
        }

        // Get the links in a DAG structure
        const linkDAG = getLinkDAG(links)
        // Format the links and put them in order
        const refs = getRefs(linkDAG, links[0], options.format, options.u && new Set())
        const objects = refs.map((ref) => ({ Ref: ref }))
        deferred.resolve(pull.values(objects))
      })
    )

    return deferred
  }
}

// Get links as a DAG Object
// { <linkName1>: [link2, link3, link4], <linkName2>: [...] }
function getLinkDAG (links) {
  const linkNames = {}
  for (const link of links) {
    linkNames[link.name] = link
  }

  const linkDAG = {}
  for (const link of links) {
    const parentName = link.path.substring(0, link.path.lastIndexOf('/'))
    linkDAG[parentName] = linkDAG[parentName] || []
    linkDAG[parentName].push(link)
  }
  return linkDAG
}

// Recursively get refs for a link
function getRefs (linkDAG, link, format, uniques) {
  let refs = []
  const children = linkDAG[link.path] || []
  for (const child of children) {
    if (!uniques || !uniques.has(child.hash)) {
      uniques && uniques.add(child.hash)
      refs.push(formatLink(link, child, format))
      refs = refs.concat(getRefs(linkDAG, child, format, uniques))
    }
  }
  return refs
}

// Get formatted link
function formatLink (src, dst, format) {
  let out = format.replace(/<src>/g, src.hash)
  out = out.replace(/<dst>/g, dst.hash)
  out = out.replace(/<linkname>/g, dst.name)
  return out
}
