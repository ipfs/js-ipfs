'use strict'

const multiaddr = require('multiaddr')
const promisify = require('promisify-es6')
const flatMap = require('lodash.flatmap')
const values = require('lodash.values')
const Stream = require('stream')

const FloodSub = require('libp2p-floodsub')

const OFFLINE_ERROR = require('../utils').OFFLINE_ERROR

module.exports = function pubsub (self) {  

  let fsub

  return {
    start: promisify((libp2pNode, callback) => {
      fsub = new FloodSub(libp2pNode)
      callback(null)
    }),

    sub: promisify((topic, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      var rs = new Stream()
      rs.readable = true
      rs._read = () => {}
      rs.cancel = () => {
        fsub.unsubscribe(topic)
      }

      fsub.on(topic, (data) => {
        console.log("PUBSUB DATA:", data.toString())
        rs.emit('data', {
          data: data.toString(),
          topicIDs: [topic],
          // these fields are currently missing from message 
          // (but are present in messages from go-ipfs pubsub)
          // from: bs58.encode(message.from),
          // data: Base64.decode(message.data),
          // seqno: Base64.decode(message.seqno)
        })
      })

      fsub.subscribe(topic)
      callback(null, rs)
    }),

    pub: promisify((topic, data, callback) => {
      if (!self.isOnline()) {
        return callback(OFFLINE_ERROR)
      }

      const out = data instanceof Buffer ? data : new Buffer(data)
      fsub.publish(topic, out)
      callback(null)
    }),

  }
}
