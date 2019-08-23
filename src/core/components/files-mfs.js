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
const isIpfs = require('is-ipfs')
const { cidToString } = require('../../utils/cid')

const mapLsFile = (options = {}) => {
  const long = options.long || options.l

  return (file) => {
    return {
      hash: long ? cidToString(file.cid, { base: options.cidBase }) : '',
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

  const withPreload = fn => (...args) => {
    const paths = args.filter(arg => isIpfs.ipfsPath(arg) || isIpfs.cid(arg))

    if (paths.length) {
      const options = args[args.length - 1]
      if (options.preload !== false) {
        paths.forEach(path => self._preload(path))
      }
    }

    return fn(...args)
  }

  return {
    cp: callbackify.variadic(withPreload(methods.cp)),
    flush: callbackify.variadic(methods.flush),
    ls: callbackify.variadic(withPreload(async (path, options = {}) => {
      const files = await all(methods.ls(path, options))

      return files.map(mapLsFile(options))
    })),
    lsReadableStream: withPreload((path, options = {}) => {
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
    }),
    lsPullStream: withPreload((path, options = {}) => {
      return pull(
        toPullStream.source(methods.ls(path, options)),
        map(mapLsFile(options))
      )
    }),
    mkdir: callbackify.variadic(methods.mkdir),
    mv: callbackify.variadic(withPreload(methods.mv)),
    read: callbackify.variadic(withPreload(async (path, options = {}) => {
      return Buffer.concat(await all(methods.read(path, options)))
    })),
    readPullStream: withPreload((path, options = {}) => {
      return toPullStream.source(methods.read(path, options))
    }),
    readReadableStream: withPreload((path, options = {}) => {
      return toReadableStream(methods.read(path, options))
    }),
    rm: callbackify.variadic(methods.rm),
    stat: callbackify.variadic(withPreload(async (path, options = {}) => {
      const stats = await methods.stat(path, options)

      stats.hash = cidToString(stats.cid, { base: options.cidBase })
      delete stats.cid

      return stats
    })),
    write: callbackify.variadic(async (path, content, options = {}) => {
      if (isPullStream.isSource(content)) {
        content = pullStreamToAsyncIterator(content)
      }

      await methods.write(path, content, options)
    })
  }
}
