'use strict'

const multihashes = require('multihashes')
const mapSeries = require('async/mapSeries')
const CID = require('cids')

exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'

const parseIpfsPath = exports.parseIpfsPath = function (pathString) {
  // example: '/ipfs/b58Hash/links/by/name'
  //  -> { root: 'b58Hash', links: ['links', 'by', 'name'] }
  const matched = pathString.match(/^(?:\/ipfs\/)?([^/]+(?:\/[^/]+)*)\/?$/)
  const errorResult = () => ({
    error: new Error('invalid ipfs ref path')
  })
  if (!matched) {
    return errorResult()
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
      return errorResult()
    }
  } catch (err) {
    return errorResult()
  }
}

exports.normalizeHashes = function (ipfs, hashes, callback) {
  // try to accept a variety of hash options including
  // multihash Buffers, base58 strings, and ipfs path
  // strings, either individually or as an array
  if (!Array.isArray(hashes)) {
    hashes = [hashes]
  }
  mapSeries(hashes, (hash, cb) => {
    const validate = (mh) => {
      try {
        multihashes.validate(mh)
        cb(null, mh)
      } catch (err) { cb(err) }
    }
    if (typeof hash === 'string') {
      const {error, root, links} = parseIpfsPath(hash)
      const rootHash = multihashes.fromB58String(root)
      if (error) return cb(error)
      if (!links.length) {
        return validate(rootHash)
      } else {
        // recursively follow named links to the target
        const pathFn = (err, obj) => {
          if (err) { return cb(err) }
          if (links.length) {
            const linkName = links.shift()
            const nextLink = obj.links.filter(link => link.name === linkName)
            if (!nextLink.length) {
              return cb(new Error(
                `no link named ${linkName} under ${obj.toJSON().Hash}`
              ))
            }
            const nextHash = nextLink[0].multihash
            ipfs.object.get(nextHash, pathFn)
          } else {
            validate(obj.multihash)
          }
        }
        ipfs.object.get(rootHash, pathFn)
      }
    } else {
      validate(hash)
    }
  }, (err, results) => {
    if (err) { return callback(err) }
    return callback(null, results)
  })
}
