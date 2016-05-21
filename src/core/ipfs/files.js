'use strict'

const Importer = require('ipfs-unixfs-engine').importer
const Exporter = require('ipfs-unixfs-engine').exporter
const UnixFS = require('ipfs-unixfs')
const promisify = require('promisify-es6')

module.exports = function files (self) {
  return {
    add: promisify((arr, callback) => {
      if (typeof arr === 'function') {
        callback = arr
        arr = undefined
      }
      if (callback === undefined) {
        callback = function noop () {}
      }
      if (arr === undefined) {
        callback(null, new Importer(self._dagS))
      }

      const i = new Importer(self._dagS)
      const res = []

      i.on('data', (info) => {
        res.push(info)
      })

      i.once('end', () => {
        callback(null, res)
      })

      arr.forEach((tuple) => {
        i.write(tuple)
      })

      i.end()
    }),

    cat: promisify((hash, callback) => {
      if (typeof hash === 'function') {
        callback = hash
        return callback('You must supply a multihash', null)
      }
      self._dagS.get(hash, (err, fetchedNode) => {
        if (err) {
          return callback(err, null)
        }
        const data = UnixFS.unmarshal(fetchedNode.data)
        if (data.type === 'directory') {
          callback('This dag node is a directory', null)
        } else {
          const exportStream = Exporter(hash, self._dagS)
          exportStream.once('data', (object) => {
            callback(null, object.stream)
          })
        }
      })
    }),

    get: promisify((hash, callback) => {
      var exportFile = Exporter(hash, self._dagS)
      callback(null, exportFile)
    })
  }
}
