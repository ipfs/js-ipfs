'use strict'

const promisify = require('promisify-es6')
// const dagPB = require('ipld-dag-pb')
// const dagCBOR = require('ipld-dag-cbor')

// const CID = require('cids')
// const mh = require('multihashes')

module.exports = function dag (self) {
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
      switch (multicodec) {
        case 'dag-pb': {} break
        case 'dag-cbor': {} break
        default:
          callback(new Error('IPLD Format not supported'))
      }
    }),
    get: promisify((cid, callback) => {
      self.ipldResolver.get(cid, callback)
    }),
    rm: promisify((cid, callback) => {
      // TODO once pinning is complete, this remove operation has to first
      // verify that some pinning chain is not broken with the operation
      self.ipldResolver.remove(cid, callback)
    }),
    resolve: promisify((cid, path, callback) => {
      self.ipldResolver.resolve(cid, path, callback)
    })
  }
}
