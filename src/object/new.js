'use strict'

const promisify = require('promisify-es6')
const dagPB = require('ipld-dag-pb')
const DAGNode = dagPB.DAGNode
const Unixfs = require('ipfs-unixfs')

module.exports = (send) => {
  return promisify((template, callback) => {
    if (typeof template === 'function') {
      callback = template
      template = undefined
    }
    send({
      path: 'object/new',
      args: template
    }, (err, result) => {
      if (err) {
        return callback(err)
      }

      let data

      if (template) {
        if (template !== 'unixfs-dir') {
          return callback(new Error('unkown template: ' + template))
        }
        data = (new Unixfs('directory')).marshal()
      } else {
        data = Buffer.alloc(0)
      }

      DAGNode.create(data, (err, node) => {
        if (err) {
          return callback(err)
        }

        if (node.toJSON().multihash !== result.Hash) {
          return callback(new Error('multihashes do not match'))
        }

        callback(null, node)
      })
    })
  })
}
