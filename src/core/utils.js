'use strict'

const promisify = require('promisify-es6')
const map = require('async/map')
const isIpfs = require('is-ipfs')
const CID = require('cids')

const ERR_BAD_PATH = 'ERR_BAD_PATH'
exports.OFFLINE_ERROR = 'This command must be run in online mode. Try running \'ipfs daemon\' first.'

/**
 * Break an ipfs-path down into it's hash and an array of links.
 *
 * examples:
 *  b58Hash -> { hash: 'b58Hash', links: [] }
 *  b58Hash/mercury/venus -> { hash: 'b58Hash', links: ['mercury', 'venus']}
 *  /ipfs/b58Hash/links/by/name -> { hash: 'b58Hash', links: ['links', 'by', 'name'] }
 *
 * @param  {String} ipfsPath An ipfs-path
 * @return {Object}            { hash: base58 string, links: [string], ?err: Error }
 * @throws on an invalid @param ipfsPath
 */
function parseIpfsPath (ipfsPath) {
  const invalidPathErr = new Error('invalid ipfs ref path')
  ipfsPath = ipfsPath.replace(/^\/ipfs\//, '')
  const matched = ipfsPath.match(/([^/]+(?:\/[^/]+)*)\/?$/)
  if (!matched) {
    throw invalidPathErr
  }

  const [hash, ...links] = matched[1].split('/')

  // check that a CID can be constructed with the hash
  if (isIpfs.cid(hash)) {
    return { hash, links }
  } else {
    throw invalidPathErr
  }
}

/**
 * Returns a well-formed ipfs Path.
 * The returned path will always be prefixed with /ipfs/ or /ipns/.
 * If the received string is not a valid ipfs path, an error will be returned
 * examples:
 *  b58Hash -> { hash: 'b58Hash', links: [] }
 *  b58Hash/mercury/venus -> { hash: 'b58Hash', links: ['mercury', 'venus']}
 *  /ipfs/b58Hash/links/by/name -> { hash: 'b58Hash', links: ['links', 'by', 'name'] }
 *
 * @param  {String} pathStr An ipfs-path, or ipns-path or a cid
 * @return {String} ipfs-path or ipns-path
 * @throws on an invalid @param ipfsPath
 */
const normalizePath = (pathStr) => {
  if (isIpfs.cid(pathStr)) {
    return `/ipfs/${pathStr}`
  } else if (isIpfs.path(pathStr)) {
    return pathStr
  } else {
    throw Object.assign(new Error(`invalid ${pathStr} path`), { code: ERR_BAD_PATH })
  }
}

/**
 * Resolve various styles of an ipfs-path to the hash of the target node.
 * Follows links in the path.
 *
 * Accepts formats:
 *  - <base58 string>
 *  - <base58 string>/link/to/venus
 *  - /ipfs/<base58 string>/link/to/pluto
 *  - multihash Buffer
 *  - Arrays of the above
 *
 * @param  {IPFS}               objectAPI The IPFS object api
 * @param  {Described above}    ipfsPaths A single or collection of ipfs-paths
 * @param  {Function<err, res>} callback res is Array<Buffer(hash)>
 *                              if no callback is passed, returns a Promise
 * @return {Promise|void}
 */
const resolvePath = promisify(function (objectAPI, ipfsPaths, callback) {
  if (!Array.isArray(ipfsPaths)) {
    ipfsPaths = [ipfsPaths]
  }

  map(ipfsPaths, (path, cb) => {
    if (typeof path !== 'string') {
      let cid

      try {
        cid = new CID(path)
      } catch (err) {
        return cb(err)
      }

      return cb(null, cid.buffer)
    }

    let parsedPath
    try {
      parsedPath = exports.parseIpfsPath(path)
    } catch (err) {
      return cb(err)
    }

    const rootHash = new CID(parsedPath.hash)
    const rootLinks = parsedPath.links

    if (!rootLinks.length) {
      return cb(null, rootHash.buffer)
    }

    objectAPI.get(rootHash, follow.bind(null, rootHash, rootLinks))

    // recursively follow named links to the target node
    function follow (cid, links, err, obj) {
      if (err) {
        return cb(err)
      }

      if (!links.length) {
        // done tracing, obj is the target node
        return cb(null, cid.buffer)
      }

      const linkName = links[0]
      const nextObj = obj.Links.find(link => link.Name === linkName)

      if (!nextObj) {
        return cb(new Error(`no link named "${linkName}" under ${cid}`))
      }

      objectAPI.get(nextObj.Hash, follow.bind(null, nextObj.Hash, links.slice(1)))
    }
  }, callback)
})

exports.normalizePath = normalizePath
exports.parseIpfsPath = parseIpfsPath
exports.resolvePath = resolvePath
