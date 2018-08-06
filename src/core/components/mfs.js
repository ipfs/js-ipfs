'use strict'

const promisify = require('promisify-es6')
const mfs = require('ipfs-mfs/core')

module.exports = self => {
  const mfsSelf = Object.assign({}, self)

  // A patched dag API to ensure preload doesn't happen for MFS operations
  // (MFS is preloaded periodically)
  mfsSelf.dag = Object.assign({}, self.dag, {
    get: promisify((cid, path, opts, cb) => {
      if (typeof path === 'function') {
        cb = path
        path = undefined
      }

      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }

      opts = Object.assign({}, opts, { preload: false })

      return self.dag.get(cid, path, opts, cb)
    }),
    put: promisify((node, opts, cb) => {
      if (typeof opts === 'function') {
        cb = opts
        opts = {}
      }

      opts = Object.assign({}, opts, { preload: false })

      return self.dag.put(node, opts, cb)
    })
  })

  return mfs(mfsSelf, mfsSelf._options)
}
