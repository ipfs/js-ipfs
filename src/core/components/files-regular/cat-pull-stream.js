'use strict'

const exporter = require('ipfs-unixfs-exporter')
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
    const cid = pathComponents[0]

    if (options.preload !== false) {
      self._preload(pathComponents[0])
    }

    const d = deferred.source()

    let closestMatchedLink

    pull(
      exporter(cid, self._ipld, options),
      pull.filter(link => {
        return link.path === ipfsPath.substring(0, link.path.length)
      }),
      pull.filter(link => {
        // save the closest matched path so we can show in error if no file was found
        if (!closestMatchedLink || link.depth > closestMatchedLink.depth) {
          closestMatchedLink = link
        }

        return link.path === ipfsPath
      }),
      pull.take(1),
      pull.collect((err, files) => {
        if (err) {
          return d.abort(err)
        }

        if (!files.length) {
          const linkNotFound = ipfsPath.substring(closestMatchedLink.path.length + 1)
          return d.abort(new Error(`no file named "${linkNotFound}" under ${closestMatchedLink.path}`))
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
