'use strict'

const { exporter } = require('ipfs-unixfs-engine')
const pull = require('pull-stream')
const deferred = require('pull-defer')
const { normalizePath } = require('./utils')

module.exports = function (self) {
  return function catPullStream (ipfsPath, options) {
    if (typeof ipfsPath === 'function') {
      throw new Error('You must supply an ipfsPath')
    }

    options = options || {}

    ipfsPath = normalizePath(ipfsPath)
    const pathComponents = ipfsPath.split('/')
    const restPath = normalizePath(pathComponents.slice(1).join('/'))
    const filterFile = (file) => (restPath && file.path === restPath) || (file.path === ipfsPath)

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    const d = deferred.source()

    pull(
      exporter(ipfsPath, self._ipld, options),
      pull.filter(filterFile),
      pull.take(1),
      pull.collect((err, files) => {
        if (err) {
          return d.abort(err)
        }

        if (!files.length) {
          return d.abort(new Error('No such file'))
        }

        const file = files[0]

        if (!file.content && file.type === 'dir') {
          return d.abort(new Error('this dag node is a directory'))
        }

        if (!file.content) {
          return d.abort(new Error('this dag node has no content'))
        }

        d.resolve(file.content)
      })
    )

    return d
  }
}
