'use strict'

const fs = require('fs-extra')
const glob = require('it-glob')
const Path = require('path')
const errCode = require('err-code')
const kindOf = require('kind-of')

/**
* Create an async iterator that yields paths that match requested file paths.
*
* @param {Iterable|AsyncIterable|String} paths File system path(s) to glob from
* @param {Object} [options] Optional options
* @param {Boolean} [options.recursive] Recursively glob all paths in directories
* @param {Boolean} [options.hidden] Include .dot files in matched paths
* @param {Array<String>} [options.ignore] Glob paths to ignore
* @param {Boolean} [options.followSymlinks] follow symlinks
* @yields {Object} File objects in the form `{ path: String, content: AsyncIterator<Buffer> }`
*/
module.exports = async function * globSource (paths, options) {
  options = options || {}

  if (kindOf(paths) === 'string') {
    paths = [paths]
  }

  const globSourceOptions = {
    recursive: options.recursive,
    glob: {
      dot: Boolean(options.hidden),
      ignore: Array.isArray(options.ignore) ? options.ignore : [],
      follow: options.followSymlinks != null ? options.followSymlinks : true
    }
  }

  // Check the input paths comply with options.recursive and convert to glob sources
  for await (const path of paths) {
    if (typeof path !== 'string') {
      throw errCode(
        new Error('Path must be a string'),
        'ERR_INVALID_PATH',
        { path }
      )
    }

    const absolutePath = Path.resolve(process.cwd(), path)
    const stat = await fs.stat(absolutePath)
    const prefix = Path.dirname(absolutePath)

    for await (const entry of toGlobSource({ path, type: stat.isDirectory() ? 'dir' : 'file', prefix }, globSourceOptions)) {
      yield entry
    }
  }
}

async function * toGlobSource ({ path, type, prefix }, options) {
  options = options || {}

  const baseName = Path.basename(path)

  if (type === 'file') {
    yield {
      path: baseName.replace(prefix, ''),
      content: fs.createReadStream(Path.isAbsolute(path) ? path : Path.join(process.cwd(), path))
    }

    return
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
    absolute: true
  })

  for await (const p of glob(path, '**/*', globOptions)) {
    yield {
      path: toPosix(p.replace(prefix, '')),
      content: fs.createReadStream(p)
    }
  }
}

const toPosix = path => path.replace(/\\/g, '/')
