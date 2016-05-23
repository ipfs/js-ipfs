'use strict'

const Importer = require('ipfs-unixfs-engine').importer
const Exporter = require('ipfs-unixfs-engine').exporter
const UnixFS = require('ipfs-unixfs')
const bs58 = require('bs58')
const through = require('through2')
const isStream = require('isstream')
const promisify = require('promisify-es6')

module.exports = function files (self) {
  return {
    createAddStream: promisify((callback) => {
      // TODO: wip
      if (data === undefined) {
        return new Importer(self._dagS)
      }
    }),

    add: promisify((data, callback) => {
      // Buffer input
      if (Buffer.isBuffer(data)) {
        data = [{
          path: '',
          content: data
        }]
      }
      // Readable stream input
      if (isStream.isReadable(data)) {
        data = [{
          path: '',
          content: data
        }]
      }
      if (!callback || typeof callback !== 'function') {
        callback = function oop () {}
      }
      if (!Array.isArray(data)) {
        return callback(new Error('"data" must be an array of { path: string, content: Buffer|Readable } or Buffer or Readable'))
      }

      const i = new Importer(self._dagS)
      const res = []

      // Transform file info tuples to DAGNodes
      i.pipe(through.obj(function transform (info, enc, next) {
        const mh = bs58.encode(info.multihash).toString()
        self._dagS.get(mh, (err, node) => {
          if (err) return callback(err)
          var obj = {
            path: info.path || mh,
            node: node
          }
          res.push(obj)
          next()
        })
      }, function end (done) {
        callback(null, res)
      }))

      data.forEach((tuple) => {
        i.write(tuple)
      })

      i.end()
    }),

    cat: (hash, callback) => {
      self._dagS.get(hash, (err, fetchedNode) => {
        if (err) {
          return callback(err, null)
        }
        const data = UnixFS.unmarshal(fetchedNode.data)
        if (data.type === 'directory') {
          callback('This dag node is a directory', null)
        } else {
          const exportStream = Exporter(hash, self._dagS)
          callback(null, exportStream)
        }
      })
    },
    get: (hash, callback) => {
      var exportFile = Exporter(hash, self._dagS)
      callback(null, exportFile)
    }
  }
}
