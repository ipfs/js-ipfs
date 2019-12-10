'use strict'

const isIpfs = require('is-ipfs')
const CID = require('cids')
const { cidToString } = require('../utils/cid')

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
 *
 * @param  {String} pathStr An ipfs-path, or ipns-path or a cid
 * @return {String} ipfs-path or ipns-path
 * @throws on an invalid @param ipfsPath
 */
const normalizePath = (pathStr) => {
  if (isIpfs.cid(pathStr)) {
    return `/ipfs/${new CID(pathStr)}`
  } else if (isIpfs.path(pathStr)) {
    return pathStr
  } else {
    throw Object.assign(new Error(`invalid path: ${pathStr}`), { code: ERR_BAD_PATH })
  }
}

// TODO: do we need both normalizePath and normalizeCidPath?
const normalizeCidPath = (path) => {
  if (Buffer.isBuffer(path)) {
    return new CID(path).toString()
  }
  if (CID.isCID(path)) {
    return path.toString()
  }
  if (path.indexOf('/ipfs/') === 0) {
    path = path.substring('/ipfs/'.length)
  }
  if (path.charAt(path.length - 1) === '/') {
    path = path.substring(0, path.length - 1)
  }
  return path
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
 * @param  {?}    ipfsPaths A single or collection of ipfs-paths
 * @return {Promise<Array<CID>>}
 */
const resolvePath = async function (objectAPI, ipfsPaths) {
  if (!Array.isArray(ipfsPaths)) {
    ipfsPaths = [ipfsPaths]
  }

  const cids = []

  for (const path of ipfsPaths) {
    if (typeof path !== 'string') {
      cids.push(new CID(path))

      continue
    }

    const parsedPath = exports.parseIpfsPath(path)
    let hash = new CID(parsedPath.hash)
    let links = parsedPath.links

    if (!links.length) {
      cids.push(hash)

      continue
    }

    // recursively follow named links to the target node
    while (true) {
      const obj = await objectAPI.get(hash)

      if (!links.length) {
        // done tracing, obj is the target node
        cids.push(hash)

        break
      }

      const linkName = links[0]
      const nextObj = obj.Links.find(link => link.Name === linkName)

      if (!nextObj) {
        throw new Error(`no link named "${linkName}" under ${hash}`)
      }

      hash = nextObj.Hash
      links = links.slice(1)
    }
  }

  return cids
}

const mapFile = (file, options) => {
  options = options || {}

  let size = 0
  let type = 'dir'

  if (file.unixfs && file.unixfs.type === 'file') {
    size = file.unixfs.fileSize()
    type = 'file'
  }

  const output = {
    hash: cidToString(file.cid, { base: options.cidBase }),
    path: file.path,
    name: file.name,
    depth: file.path.split('/').length,
    size,
    type
  }

  if (options.includeContent && file.unixfs && file.unixfs.type === 'file') {
    output.content = file.content
  }

  return output
}

exports.normalizePath = normalizePath
exports.normalizeCidPath = normalizeCidPath
exports.parseIpfsPath = parseIpfsPath
exports.resolvePath = resolvePath
exports.mapFile = mapFile
