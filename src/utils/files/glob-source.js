'use strict'

const fs = require('fs')
const Path = require('path')
const isString = require('lodash/isString')
const pull = require('pull-stream')
const glob = require('glob')
const cat = require('pull-cat')
const defer = require('pull-defer')
const pushable = require('pull-pushable')
const map = require('async/map')
const parallel = require('async/parallel')
const errCode = require('err-code')

/**
* Create a pull stream source that can be piped to ipfs.addPullStream for the
* provided file paths.
*
* @param ...paths {String} File system path(s) to glob from
* @param [options] {Object} Optional options
* @param [options.recursive] Recursively glob all paths in directories
*/
module.exports = (...args) => {
  const options = isString(args[args.length - 1]) ? {} : args.pop()
  const paths = args
  const deferred = defer.source()

  const globSourceOptions = {
    recursive: options.recursive,
    glob: {
      dot: Boolean(options.hidden),
      ignore: Array.isArray(options.ignore) ? options.ignore : [],
      follow: options.followSymlinks != null ? options.followSymlinks : true
    }
  }

  // Check the input paths comply with options.recursive and convert to glob sources
  map(paths, normalizePathWithType, (err, results) => {
    if (err) return deferred.abort(err)

    try {
      const sources = results.map(res => toGlobSource(res, globSourceOptions))
      return deferred.resolve(cat(sources))
    } catch (err) {
      return deferred.abort(err)
    }
  })

  return pull(
    deferred,
    pull.map(({ path, contentPath }) => ({
      path,
      content: fs.createReadStream(contentPath)
    }))
  )
}

function toGlobSource ({ path, type }, options) {
  options = options || {}

  const baseName = Path.basename(path)

  if (type === 'file') {
    return pull.values([{ path: baseName, contentPath: path }])
  }

  if (type === 'dir' && !options.recursive) {
    throw errCode(
      new Error(`'${path}' is a directory and recursive option not set`),
      'ERR_DIR_NON_RECURSIVE',
      { path }
    )
  }

  const globOptions = Object.assign({}, options.glob, {
    cwd: path,
    nodir: true,
    realpath: false,
    absolute: false
  })

  // TODO: want to use pull-glob but it doesn't have the features...
  const pusher = pushable()

  glob('**/*', globOptions)
    .on('match', m => pusher.push(m))
    .on('end', () => pusher.end())
    .on('abort', () => pusher.end())
    .on('error', err => pusher.end(err))

  return pull(
    pusher,
    pull.map(p => ({
      path: Path.join(baseName, p),
      contentPath: Path.join(path, p)
    }))
  )
}

function normalizePathWithType (path, cb) {
  parallel({
    stat: cb => fs.stat(path, cb),
    realpath: cb => fs.realpath(path, cb)
  }, (err, res) => {
    if (err) return cb(err)
    cb(null, { path: res.realpath, type: res.stat.isDirectory() ? 'dir' : 'file' })
  })
}
