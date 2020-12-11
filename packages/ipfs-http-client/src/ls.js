'use strict'

const CID = require('cids')
const configure = require('./lib/configure')
const toUrlSearchParams = require('./lib/to-url-search-params')
const stat = require('./files/stat')

module.exports = configure((api, opts) => {
  return async function * ls (path, options = {}) {
    const pathStr = `${path instanceof Uint8Array ? new CID(path) : path}`

    async function mapLink (link) {
      let hash = link.Hash

      if (hash.includes('/')) {
        // the hash is a path, but we need the CID
        const ipfsPath = hash.startsWith('/ipfs/') ? hash : `/ipfs/${hash}`
        const stats = await stat(opts)(ipfsPath)

        hash = stats.cid
      }

      const entry = {
        name: link.Name,
        path: pathStr + (link.Name ? `/${link.Name}` : ''),
        size: link.Size,
        cid: new CID(hash),
        type: typeOf(link),
        depth: link.Depth || 1
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
      timeout: options.timeout,
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
})

function typeOf (link) {
  switch (link.Type) {
    case 1:
    case 5:
      return 'dir'
    case 2:
      return 'file'
    default:
      return 'unknown'
  }
}
