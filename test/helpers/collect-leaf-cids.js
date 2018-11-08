'use strict'

const pull = require('pull-stream')
const traverse = require('pull-traverse')
const CID = require('cids')

module.exports = (mfs, multihash) => {
  return new Promise((resolve, reject) => {
    pull(
      traverse.depthFirst(new CID(multihash), (cid) => {
        return pull(
          pull.values([cid]),
          pull.asyncMap((cid, callback) => {
            mfs.ipld.get(cid, (error, result) => {
              callback(error, !error && result.value)
            })
          }),
          pull.asyncMap((node, callback) => {
            if (!node.links) {
              return callback()
            }

            return callback(
              null, node.links.map(link => link.cid)
            )
          }),
          pull.filter(Boolean),
          pull.flatten()
        )
      }),
      pull.collect((error, cids) => {
        if (error) {
          return reject(error)
        }

        resolve(cids)
      })
    )
  })
}
