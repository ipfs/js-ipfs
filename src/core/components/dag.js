'use strict'

const promisify = require('promisify-es6')

const dagPB = require('ipld-dag-pb')
const dagCBOR = require('ipld-dag-cbor')

module.exports = function dag (self) {
  return {
    put: promisify((dagNode, multicodec, hashAlg, callback) => {
      switch (multicodec) {
        case 'dag-pb': dagPB.util.cid(dagNode, gotCid); break
        case 'dag-cbor': dagCBOR.util.cid(dagNode, gotCid); break
        default: callback(new Error('IPLD Format not supported'))
      }

      function gotCid (err, cid) {
        if (err) {
          return callback(err)
        }
        self._ipldResolver.put({
          node: dagNode,
          cid: cid
        }, callback)
      }
    }),
    get: promisify((cid, callback) => {
      self._ipldResolver.get(cid, callback)
    }),
    rm: promisify((cid, callback) => {
      // TODO once pinning is complete, this remove operation has to first
      // verify that some pinning chain is not broken with the operation
      self._ipldResolver.remove(cid, callback)
    }),
    resolve: promisify((cid, path, callback) => {
      self._ipldResolver.resolve(cid, path, callback)
    })
  }
}
