'use strict'

const Importer = require('ipfs-unixfs-engine').importer
const Exporter = require('ipfs-unixfs-engine').exporter
const UnixFS = require('ipfs-unixfs')
const promisify = require('promisify-es6')

module.exports = function files (self) {
  return {
    add: promisify((arr, cb) => {
      if (typeof arr === 'function') {
        cb = arr
        arr = undefined
      }
      if (cb === undefined) {
        cb = function noop () {}
      }
      if (arr === undefined) {
        return new Importer(self._dagS)
      }

      const i = new Importer(self._dagS)
      const res = []

      i.on('data', (info) => {
        res.push(info)
      })

      i.once('end', () => {
        cb(null, res)
      })

      arr.forEach((tuple) => {
        i.write(tuple)
      })

      i.end()
    }),

    cat: promisify((hash, cb) => {
      self._dagS.get(hash, (err, fetchedNode) => {
        if (err) {
          return cb(err, null)
        }
        const data = UnixFS.unmarshal(fetchedNode.data)
        if (data.type === 'directory') {
          cb('This dag node is a directory', null)
        } else {
          const exportStream = Exporter(hash, self._dagS)
          exportStream.once('data', (object) => {
            cb(null, object.stream)
          })
        }
      })
    }),

    get: promisify((hash, cb) => {
      var exportFile = Exporter(hash, self._dagS)
      cb(null, exportFile)
    })
  }
}
