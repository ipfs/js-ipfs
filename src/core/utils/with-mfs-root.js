'use strict'

const CID = require('cids')
const UnixFs = require('ipfs-unixfs')
const {
  DAGNode
} = require('ipld-dag-pb')
const log = require('debug')('ipfs:mfs:utils:with-mfs-root')
const mc = require('multicodec')
const mh = require('multihashes')

const {
  MFS_ROOT_KEY
} = require('./constants')

const loadMfsRoot = async (context) => {
  // Open the repo if it's been closed
  await context.repo.datastore.open()

  // Load the MFS root CID
  let cid

  try {
    const buf = await context.repo.datastore.get(MFS_ROOT_KEY)

    cid = new CID(buf)
  } catch (err) {
    if (err.code !== 'ERR_NOT_FOUND') {
      throw err
    }

    log('Creating new MFS root')
    const node = new DAGNode(new UnixFs('directory').marshal())
    cid = await context.ipld.put(node, mc.DAG_PB, {
      cidVersion: 0,
      hashAlg: mh.names['sha2-256'] // why can't ipld look this up?
    })

    await context.repo.datastore.put(MFS_ROOT_KEY, cid.buffer)
  }

  log(`Loaded MFS root /ipfs/${cid}`)

  return cid
}

module.exports = loadMfsRoot
