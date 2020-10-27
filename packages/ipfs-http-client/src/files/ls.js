'use strict'

const CID = require('cids')
const toCamelWithMetadata = require('../lib/object-to-camel-with-metadata')
const configure = require('../lib/configure')
const toUrlSearchParams = require('../lib/to-url-search-params')

module.exports = configure(api => {
  /**
   * @type {import('..').Implements<typeof import('ipfs-core/src/components/files/ls')>}
   */
  async function * ls (path, options = {}) {
    if (!path || typeof path !== 'string') {
      throw new Error('ipfs.files.ls requires a path')
    }

    const res = await api.post('files/ls', {
      timeout: options.timeout,
      signal: options.signal,
      searchParams: toUrlSearchParams({
        arg: CID.isCID(path) ? `/ipfs/${path}` : path,
        // default long to true, diverges from go-ipfs where its false by default
        long: true,
        ...options,
        stream: true
      }),
      headers: options.headers
    })

    for await (const result of res.ndjson()) {
      // go-ipfs does not yet support the "stream" option
      if ('Entries' in result) {
        for (const entry of result.Entries || []) {
          yield toCoreInterface(toCamelWithMetadata(entry))
        }
      } else {
        yield toCoreInterface(toCamelWithMetadata(result))
      }
    }
  }

  return ls
})

function toCoreInterface (entry) {
  if (entry.hash) {
    entry.cid = new CID(entry.hash)
  }

  delete entry.hash

  entry.type = entry.type === 1 ? 'directory' : 'file'

  return entry
}
