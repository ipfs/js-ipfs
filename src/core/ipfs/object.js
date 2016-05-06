'use strict'

const Block = require('ipfs-block')
const mDAG = require('ipfs-merkle-dag')
const DAGNode = mDAG.DAGNode

module.exports = function object (self) {
  return {
    new: (template, callback) => {
      if (!callback) {
        callback = template
      }
      var node = new DAGNode()
      var block = new Block(node.marshal())
      self._blockS.addBlock(block, function (err) {
        if (err) {
          return callback(err)
        }
        callback(null, {
          Hash: block.key,
          Size: node.size(),
          Name: ''
        })
      })
    },
    patch: {
      appendData: (multihash, data, callback) => {
        self.object.get(multihash, (err, obj) => {
          if (err) {
            return callback(err)
          }
          obj.data = Buffer.concat([obj.data, data])
          self._dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      addLink: (multihash, link, callback) => {
        self.object.get(multihash, (err, obj) => {
          if (err) {
            return callback(err)
          }
          obj.addRawLink(link)
          self._dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      rmLink: (multihash, linkRef, callback) => {
        self.object.get(multihash, (err, obj) => {
          if (err) {
            return callback(err)
          }
          obj.links = obj.links.filter((link) => {
            // filter by name when linkRef is a string, or by hash otherwise
            if (typeof linkRef === 'string') {
              return link.name !== linkRef
            }
            return !link.hash.equals(linkRef)
          })
          self._dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      },
      setData: (multihash, data, callback) => {
        self.object.get(multihash, (err, obj) => {
          if (err) { return callback(err) }
          obj.data = data
          self._dagS.add(obj, (err) => {
            if (err) {
              return callback(err)
            }
            callback(null, obj)
          })
        })
      }
    },
    data: (multihash, callback) => {
      self.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        callback(null, obj.data)
      })
    },
    links: (multihash, callback) => {
      self.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        callback(null, obj.links)
      })
    },
    get: (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      self._dagS.get(multihash, callback)
    },
    put: (dagNode, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }
      self._dagS.add(dagNode, callback)
    },
    stat: (multihash, options, callback) => {
      if (typeof options === 'function') {
        callback = options
        options = {}
      }

      self.object.get(multihash, (err, obj) => {
        if (err) {
          return callback(err)
        }
        var res = {
          NumLinks: obj.links.length,
          BlockSize: obj.marshal().length,
          LinksSize: obj.links.reduce((prev, link) => {
            return prev + link.size
          }, 0),
          DataSize: obj.data.length,
          CumulativeSize: ''
        }
        callback(null, res)
      })
    }
  }
}
