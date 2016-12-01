'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const CID = require('cids')
// const mh = require('multihashes')

module.exports = function object (self) {
  return {
    put: promisify((dagNode, multicodec, hashAlg, callback) => {
      // TODO
      // serialize
      // get right hash
      // generate cid
      // put in IPLD Resolver

      /*
        self._ipldResolver.put({
          node: node,
          cid: new CID(node.multihash)
        }
      */
    }),
    get: promisify((cid, callback) => {
      self.ipldResolver.get(cid, callback)
    }),
    resolve: promisify((cid, path, callback) => {
      // TODO
    })
  }
}
