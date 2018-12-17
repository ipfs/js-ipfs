'use strict'

const fs = require('fs')
const Path = require('path')
const pull = require('pull-stream')
const glob = require('glob')
const cat = require('pull-cat')
const defer = require('pull-defer')
const pushable = require('pull-pushable')
const map = require('async/map')
const errCode = require('err-code')

/**
* Create a pull stream source that can be piped to ipfs.addPullStream for the
* provided file paths.
*
* @param {String} ...paths File system path(s) to glob from
* @param {Object} [options] Optional options
* @param {Boolean} [options.recursive] Recursively glob all paths in directories
* @param {Boolean} [options.hidden] Include .dot files in matched paths
* @param {Array<String>} [options.ignore] Glob paths to ignore
* @param {Boolean} [options.followSymlinks] follow symlinks
* @returns {Function} pull stream source
*/
module.exports = (...args) => {
  const options = typeof args[args.length - 1] === 'string' ? {} : args.pop()
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
  map(paths, pathAndType, (err, results) => {
    if (err) return deferred.abort(err)

    try {
      const sources = results.map(res => toGlobSource(res, globSourceOptions))
      deferred.resolve(cat(sources))
    } catch (err) {
      deferred.abort(err)
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
      path: `${baseName}/${toPosix(p)}`,
      contentPath: Path.join(path, p)
    }))
  )
}

function pathAndType (path, cb) {
  fs.stat(path, (err, stat) => {
    if (err) return cb(err)
    cb(null, { path, type: stat.isDirectory() ? 'dir' : 'file' })
  })
}

const toPosix = path => path.replace(/\\/g, '/')
