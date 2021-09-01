'use strict'

const { CID } = require('multiformats/cid')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')
const stat = require('./files/stat')

/**
 * @typedef {import('./types').HTTPClientExtraOptions} HTTPClientExtraOptions
 * @typedef {import('ipfs-core-types/src/root').API<HTTPClientExtraOptions>} RootAPI
 */

module.exports = configure((api, opts) => {
  /**
   * @type {RootAPI["ls"]}
   */
  async function * ls (path, options = {}) {
    const pathStr = `${path instanceof Uint8Array ? CID.decode(path) : path}`

    /**
     * @param {*} link
     */
    async function mapLink (link) {
      let hash = link.Hash

      if (hash.includes('/')) {
        // the hash is a path, but we need the CID
        const ipfsPath = hash.startsWith('/ipfs/') ? hash : `/ipfs/${hash}`
        const stats = await stat(opts)(ipfsPath)

        hash = stats.cid
      } else {
        hash = CID.parse(hash)
      }

      /** @type {import('ipfs-core-types/src/root').IPFSEntry} */
      const entry = {
        name: link.Name,
        path: pathStr + (link.Name ? `/${link.Name}` : ''),
        size: link.Size,
        cid: hash,
        type: typeOf(link)
      }

      if (link.Mode) {
        entry.mode = parseInt(link.Mode, 8)
      }

      if (link.Mtime !== undefined && link.Mtime !== null) {
        entry.mtime = {
          secs: link.Mtime
        }

        if (link.MtimeNsecs !== undefined && link.MtimeNsecs !== null) {
          entry.mtime.nsecs = link.MtimeNsecs
        }
      }

      return entry
    }

    const res = await api.post('ls', {
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: pathStr,
        ...options
      }),
      headers: options.headers
    })

    for await (let result of res.ndjson()) {
      result = result.Objects

      if (!result) {
        throw new Error('expected .Objects in results')
      }

      result = result[0]
      if (!result) {
        throw new Error('expected one array in results.Objects')
      }

      const links = result.Links
      if (!Array.isArray(links)) {
        throw new Error('expected one array in results.Objects[0].Links')
      }

      if (!links.length) {
        // no links, this is a file, yield a single result
        yield mapLink(result)

        return
      }

      yield * links.map(mapLink)
    }
  }
  return ls
})

/**
 * @param {any} link
 */
function typeOf (link) {
  switch (link.Type) {
    case 1:
    case 5:
      return 'dir'
    case 2:
      return 'file'
    default:
      return 'file'
  }
}
