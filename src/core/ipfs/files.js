'use strict'

const unixfsEngine = require('ipfs-unixfs-engine')
const Importer = unixfsEngine.Importer
const Exporter = unixfsEngine.Exporter
const UnixFS = require('ipfs-unixfs')
const through = require('through2')
const isStream = require('isstream')
const promisify = require('promisify-es6')
const Duplex = require('stream').Duplex
const multihashes = require('multihashes')

module.exports = function files (self) {
  return {
    createAddStream: (callback) => {
      const i = new Importer(self._dagS)
      const ds = new Duplex({ objectMode: true })

      ds._read = (n) => {}
      ds._write = (file, enc, next) => {
        i.write(file)
        next()
      }

      ds.end = () => {
        i.end()
      }

      let counter = 0

      i.on('data', (file) => {
        counter++
        self.object.get(file.multihash, (err, node) => {
          if (err) {
            return ds.emit('error', err)
          }
          ds.push({path: file.path, node: node})
          counter--
        })
      })

      i.on('end', () => {
        function canFinish () {
          if (counter === 0) {
            ds.push(null)
          } else {
            setTimeout(canFinish, 100)
          }
        }
        canFinish()
      })

      callback(null, ds)
    },
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
        callback = function noop () {}
      }
      if (!Array.isArray(data)) {
        return callback(new Error('"data" must be an array of { path: string, content: Buffer|Readable } or Buffer or Readable'))
      }

      const i = new Importer(self._dagS)
      const res = []

      // Transform file info tuples to DAGNodes
      i.pipe(through.obj((info, enc, next) => {
        const mh = multihashes.toB58String(info.multihash)
        self._dagS.get(mh, (err, node) => {
          if (err) return callback(err)
          var obj = {
            path: info.path || mh,
            node: node
          }
          res.push(obj)
          next()
        })
      }, (done) => {
        callback(null, res)
      }))

      data.forEach((tuple) => {
        i.write(tuple)
      })

      i.end()
    }),

    cat: promisify((hash, callback) => {
      if (typeof hash === 'function') {
        return callback(new Error('You must supply a multihash'))
      }
      self._dagS.get(hash, (err, fetchedNode) => {
        if (err) {
          return callback(err)
        }
        const data = UnixFS.unmarshal(fetchedNode.data)
        if (data.type === 'directory') {
          callback(new Error('This dag node is a directory'))
        } else {
          const exportStream = Exporter(hash, self._dagS)
          exportStream.once('data', (object) => {
            callback(null, object.content)
          })
        }
      })
    }),

    get: promisify((hash, callback) => {
      const exportFile = Exporter(hash, self._dagS)
      callback(null, exportFile)
    })
  }
}
