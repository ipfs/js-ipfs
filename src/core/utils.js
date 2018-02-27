'use strict'

const multihashes = require('multihashes')
const mapSeries = require('async/mapSeries')
const CID = require('cids')

exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'

/**
 * Break an ipfs-path down into it's root hash and an array of links.
 *
 * example:
 *  /ipfs/b58Hash/links/by/name -> { root: 'b58Hash', links: ['links', 'by', 'name'] }
 *
 * @param  {String} pathString An ipfs-path
 * @return {Object}            { root: base58 string, links: [string], ?err: Error }
 */
const parseIpfsPath = exports.parseIpfsPath = function parseIpfsPath (pathString) {
  const matched = pathString.match(/^(?:\/ipfs\/)?([^/]+(?:\/[^/]+)*)\/?$/)
  const errorResult = {
    error: new Error('invalid ipfs ref path')
  }
  if (!matched) {
    return errorResult
  }
  const split = matched[1].split('/')
  const root = split[0]
  try {
    if (CID.isCID(new CID(root))) {
      return {
        root: root,
        links: split.slice(1, split.length)
      }
    } else {
      return errorResult
    }
  } catch (err) {
    return errorResult
  }
}

/**
 * Resolve various styles of an ipfs-path to the hash of the destination node after
 * following any links described in the path.
 *
 * Handles formats:
 *  - <base58 string>
 *  - <base58 string>/link/to/another/planet
 *  - /ipfs/<base58 string>
 *  - multihash Buffer
 *  - Buffers of any of the above
 *
 * @param  {IPFS}   ipfs       the IPFS node
 * @param  {Described above}   ipfsPaths A single or collection of ipfs-paths
 * @param  {Function} callback Node-style callback. res is Array<Buffer(hash)>
 * @return {void}
 */
exports.normalizeHashes = function normalizeHashes (ipfs, ipfsPaths, callback) {
  if (!Array.isArray(ipfsPaths)) {
    ipfsPaths = [ipfsPaths]
  }
  mapSeries(ipfsPaths, (path, cb) => {
    const validate = (mh) => {
      try {
        multihashes.validate(mh)
        cb(null, mh)
      } catch (err) { cb(err) }
    }
    if (typeof path !== 'string') {
      return validate(path)
    }
    const {error, root, links} = parseIpfsPath(path)
    const rootHash = multihashes.fromB58String(root)
    if (error) return cb(error)
    if (!links.length) {
      return validate(rootHash)
    }
    // recursively follow named links to the target node
    const pathFn = (err, obj) => {
      if (err) { return cb(err) }
      if (!links.length) {
        // done tracing, we have the target node
        return validate(obj.multihash)
      }
      const linkName = links.shift()
      const nextLink = obj.links.find(link => link.name === linkName)
      if (!nextLink) {
        return cb(new Error(
          `no link named ${linkName} under ${obj.toJSON().Hash}`
        ))
      }
      const nextHash = nextLink.multihash
      ipfs.object.get(nextHash, pathFn)
    }
    ipfs.object.get(rootHash, pathFn)
  }, callback)
}
