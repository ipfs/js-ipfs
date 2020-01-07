'use strict'

const pTryEach = require('p-try-each')
const mh = require('multihashes')
const debug = require('debug')
const log = debug('jsipfs:http:response:resolver')
log.error = debug('jsipfs:http:response:resolver:error')
const dirView = require('./dir-view')

const INDEX_HTML_FILES = [
  'index.html',
  'index.htm',
  'index.shtml'
]

const findIndexFile = (ipfs, path) => {
  return pTryEach(INDEX_HTML_FILES.map(file => {
    return async () => {
      const stats = await ipfs.files.stat(`${path}/${file}`)

      return {
        name: file,
        cid: stats.cid
      }
    }
  }))
}

const directory = async (ipfs, path, cid) => {
  // Test if it is a Website
  try {
    const res = await findIndexFile(ipfs, path)

    return [{ Name: res.name }]
  } catch (err) {
    if (err.message.includes('does not exist')) {
      // not a website, just show a directory listing
      const result = await ipfs.dag.get(cid)

      return dirView.render(path, result.value.Links)
    }

    throw err
  }
}

const cid = async (ipfs, path) => {
  const stats = await ipfs.files.stat(path)

  if (stats.type.includes('directory')) {
    const err = new Error('This dag node is a directory')
    err.cid = stats.cid
    err.fileName = stats.name
    err.dagDirType = stats.type

    throw err
  }

  return { cid: stats.cid }
}

const multihash = async (ipfs, path) => {
  // deprecated, use 'cid' instead
  // (left for backward-compatibility)
  const result = await cid(ipfs, path)

  return { multihash: mh.toB58String(result.cid.multihash) }
}

module.exports = {
  directory,
  cid,
  multihash
}
