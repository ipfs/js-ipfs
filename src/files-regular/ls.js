'use strict'

const IsIpfs = require('is-ipfs')
const cleanCID = require('../utils/clean-cid')
const configure = require('../lib/configure')

module.exports = configure(({ ky }) => {
  return async function * ls (path, options) {
    options = options || {}

    try {
      path = cleanCID(path)
    } catch (err) {
      if (!IsIpfs.ipfsPath(path)) {
        throw err
      }
    }

    const searchParams = new URLSearchParams()
    searchParams.set('arg', path.toString())

    if (options.long !== undefined) {
      searchParams.set('long', options.long)
    }

    if (options.unsorted !== undefined) {
      searchParams.set('unsorted', options.unsorted)
    }

    if (options.recursive !== undefined) {
      searchParams.set('recursive', options.recursive)
    }

    const res = await ky.get('ls', {
      timeout: options.timeout,
      signal: options.signal,
      headers: options.headers,
      searchParams
    })

    let result = await res.json()

    result = result.Objects
    if (!result) {
      throw new Error('expected .Objects in results')
    }

    result = result[0]
    if (!result) {
      throw new Error('expected one array in results.Objects')
    }

    result = result.Links
    if (!Array.isArray(result)) {
      throw new Error('expected one array in results.Objects[0].Links')
    }

    for (const link of result) {
      yield {
        name: link.Name,
        path: path + '/' + link.Name,
        size: link.Size,
        hash: link.Hash,
        type: typeOf(link),
        depth: link.Depth || 1
      }
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
