'use strict'

const exporter = require('ipfs-unixfs-exporter')
const deferred = require('pull-defer')
const pull = require('pull-stream/pull')
const once = require('pull-stream/sources/once')
const map = require('pull-stream/throughs/map')
const filter = require('pull-stream/throughs/filter')
const errCode = require('err-code')
const toPullStream = require('async-iterator-to-pull-stream')
const { normalizePath, mapFile } = require('./utils')

module.exports = function (self) {
  return function (ipfsPath, options) {
    options = options || {}

    const path = normalizePath(ipfsPath)
    const recursive = options.recursive
    const pathComponents = path.split('/')

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    const d = deferred.source()

    exporter(ipfsPath, self._ipld, options)
      .then(file => {
        if (!file.unixfs) {
          return d.abort(errCode(new Error('dag node was not a UnixFS node'), 'ENOTUNIXFS'))
        }

        if (file.unixfs.type === 'file') {
          return d.resolve(once(mapFile(options)(file)))
        }

        if (file.unixfs.type.includes('dir')) {
          if (recursive) {
            return d.resolve(pull(
              toPullStream.source(exporter.recursive(file.cid, self._ipld, options)),
              filter(child => file.cid.toBaseEncodedString() !== child.cid.toBaseEncodedString()),
              map(mapFile(options))
            ))
          }

          return d.resolve(pull(
            toPullStream.source(file.content()),
            map(mapFile(options)),
            map((file) => {
              file.depth--

              return file
            })
          ))
        }

        d.abort(errCode(new Error(`Unknown UnixFS type ${file.unixfs.type}`), 'EUNKNOWNUNIXFSTYPE'))
      }, err => {
        d.abort(err)
      })

    return d
  }
}
