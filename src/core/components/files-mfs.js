'use strict'

const mfs = require('ipfs-mfs/core')
const isPullStream = require('is-pull-stream')
const toPullStream = require('async-iterator-to-pull-stream')
const toReadableStream = require('async-iterator-to-stream')
const pullStreamToAsyncIterator = require('pull-stream-to-async-iterator')
const all = require('async-iterator-all')
const callbackify = require('callbackify')
const PassThrough = require('stream').PassThrough
const pull = require('pull-stream/pull')
const map = require('pull-stream/throughs/map')

const mapLsFile = (options = {}) => {
  const long = options.long || options.l

  return (file) => {
    return {
      hash: long ? file.cid.toBaseEncodedString(options.cidBase) : '',
      name: file.name,
      type: long ? file.type : 0,
      size: long ? file.size || 0 : 0
    }
  }
}

module.exports = self => {
  const methods = mfs({
    ipld: self._ipld,
    blocks: self._blockService,
    datastore: self._repo.root,
    repoOwner: self._options.repoOwner
  })

  return {
    cp: callbackify.variadic(methods.cp),
    flush: callbackify.variadic(methods.flush),
    ls: callbackify.variadic(async (path, options = {}) => {
      const files = await all(methods.ls(path, options))

      return files.map(mapLsFile(options))
    }),
    lsReadableStream: (path, options = {}) => {
      const stream = toReadableStream.obj(methods.ls(path, options))
      const through = new PassThrough({
        objectMode: true
      })
      stream.on('data', (file) => {
        through.write(mapLsFile(options)(file))
      })
      stream.on('error', (err) => {
        through.destroy(err)
      })
      stream.on('end', (file, enc, cb) => {
        if (file) {
          file = mapLsFile(options)(file)
        }

        through.end(file, enc, cb)
      })

      return through
    },
    lsPullStream: (path, options = {}) => {
      return pull(
        toPullStream.source(methods.ls(path, options)),
        map(mapLsFile(options))
      )
    },
    mkdir: callbackify.variadic(methods.mkdir),
    mv: callbackify.variadic(methods.mv),
    read: callbackify(async (path, options = {}) => {
      return Buffer.concat(await all(methods.read(path, options)))
    }),
    readPullStream: (path, options = {}) => {
      return toPullStream.source(methods.read(path, options))
    },
    readReadableStream: (path, options = {}) => {
      return toReadableStream(methods.read(path, options))
    },
    rm: callbackify.variadic(methods.rm),
    stat: callbackify(async (path, options = {}) => {
      const stats = await methods.stat(path, options)

      stats.hash = stats.cid.toBaseEncodedString(options && options.cidBase)
      delete stats.cid

      return stats
    }),
    write: callbackify.variadic(async (path, content, options = {}) => {
      if (isPullStream.isSource(content)) {
        content = pullStreamToAsyncIterator(content)
      }

      await methods.write(path, content, options)
    })
  }
}
