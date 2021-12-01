import { UnixFS } from 'ipfs-unixfs'

/**
 * @param {string} path
 * @param {import('ipfs-core-types').IPFS} ipfs
 */
export default async function dumpShard (path, ipfs) {
  const stats = await ipfs.files.stat(path)
  const { value: node } = await ipfs.dag.get(stats.cid)
  const entry = UnixFS.unmarshal(node.Data)

  if (entry.type !== 'hamt-sharded-directory') {
    throw new Error('Not a shard')
  }

  await dumpSubShard(stats.cid, ipfs)
}

/**
 * @param {import('multiformats/cid').CID} cid
 * @param {import('ipfs-core-types').IPFS} ipfs
 * @param {string} prefix
 */
async function dumpSubShard (cid, ipfs, prefix = '') {
  const { value: node } = await ipfs.dag.get(cid)
  const entry = UnixFS.unmarshal(node.Data)

  if (entry.type !== 'hamt-sharded-directory') {
    throw new Error('Not a shard')
  }

  for (const link of node.Links) {
    const { value: subNode } = await ipfs.dag.get(link.Hash)
    const subEntry = UnixFS.unmarshal(subNode.Data)
    console.info(`${prefix}${link.Name}`, ' ', subEntry.type) // eslint-disable-line no-console

    if (link.Name.length === 2) {
      await dumpSubShard(link.Hash, ipfs, `${prefix}  `)
    }
  }
}
