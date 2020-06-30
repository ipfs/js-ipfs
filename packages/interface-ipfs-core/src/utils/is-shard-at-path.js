'use strict'

const UnixFS = require('ipfs-unixfs')

module.exports = async (path, ipfs) => {
  const stats = await ipfs.files.stat(path)
  const { value: node } = await ipfs.dag.get(stats.cid)
  const entry = UnixFS.unmarshal(node.Data)

  return entry.type === 'hamt-sharded-directory'
}
