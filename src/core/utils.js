'use strict'

const multihashes = require('multihashes')
const each = require('async/each')

exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'

const splitIpfsPath = exports.splitIpfsPath = function (pathString) {
  // example: '/ipfs/b58Hash/links/by/name'
  //  -> { root: 'b58Hash', links: ['links', 'by', 'name'] }
  const matched = pathString.match(/^(?:\/ipfs\/)?([^/]+(?:\/[^/]+)*)\/?$/)
  if (!matched) {
    return {
      error: new Error('invalid ipfs ref path')
    }
  }
  const split = matched[1].split('/')
  return {
    root: split[0],
    links: split.slice(1, split.length)
  }
}

exports.normalizeHashes = function (ipfs, hashes, callback) {
  // try to accept a variety of hash options including
  // multihash Buffers, base58 strings, and ipfs path
  // strings, either individually or as an array
  if (!Array.isArray(hashes)) {
    hashes = [hashes]
  }
  const normalized = {
    hashes: [],
    update: (multihash, cb) => {
      try {
        multihashes.validate(multihash)
      } catch (err) { return cb(err) }

      normalized.hashes.push(multihash)
      cb()
    }
  }
  each(hashes, (hash, cb) => {
    if (typeof hash === 'string') {
      const {error, root, links} = splitIpfsPath(hash)
      const rootHash = multihashes.fromB58String(root)
      if (error) return cb(error)
      if (!links.length) {
        normalized.update(rootHash, cb)
      } else {
        // recursively follow named links to the target
        const pathFn = (err, obj) => {
          if (err) { return cb(err) }
          if (links.length) {
            const linkName = links.shift()
            const nextLink = obj.links.filter((link) => {
              return (link.name === linkName)
            })
            if (!nextLink.length) {
              return cb(new Error(
                `no link named ${linkName} under ${obj.toJSON().Hash}`
              ))
            }
            const nextHash = nextLink[0].multihash
            ipfs.object.get(nextHash, pathFn)
          } else {
            normalized.update(obj.multihash, cb)
          }
        }
        ipfs.object.get(rootHash, pathFn)
      }
    } else {
      normalized.update(hash, cb)
    }
  }, (err) => {
    if (err) { return callback(err) }
    return callback(null, normalized.hashes)
  })
}
