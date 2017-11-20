'use strict'

const isNode = require('detect-node')
const flatmap = require('flatmap')
const escape = require('glob-escape')

function strip (name, base) {
  const smallBase = base
    .split('/')
    .slice(0, -1)
    .join('/') + '/'
  return name.replace(smallBase, '')
}

function loadPaths (opts, file) {
  const path = require('path')
  const fs = require('fs')
  const glob = require('glob')

  const followSymlinks = opts.followSymlinks != null ? opts.followSymlinks : true

  file = path.resolve(file)
  const stats = fs.statSync(file)

  if (stats.isDirectory() && !opts.recursive) {
    throw new Error('Can only add directories using --recursive')
  }

  if (stats.isDirectory() && opts.recursive) {
    // glob requires a POSIX filename
    file = file.split(path.sep).join('/')
    const globEscapedDir = escape(file) + (file.endsWith('/') ? '' : '/')
    const mg = new glob.sync.GlobSync(`${globEscapedDir}` + '**/*', {
      follow: followSymlinks,
      dot: opts.hidden,
      ignore: (opts.ignore || []).map((ignoreGlob) => {
        return globEscapedDir + ignoreGlob
      })
    })

    return mg.found
      .map((name) => {
        // symlinks
        if (mg.symlinks[name] === true) {
          return {
            path: strip(name, file),
            symlink: true,
            dir: false,
            content: fs.readlinkSync(name)
          }
        }

        // files
        if (mg.cache[name] === 'FILE') {
          return {
            path: strip(name, file),
            symlink: false,
            dir: false,
            content: fs.createReadStream(name)
          }
        }

        // directories
        if (mg.cache[name] === 'DIR' || mg.cache[name] instanceof Array) {
          return {
            path: strip(name, file),
            symlink: false,
            dir: true
          }
        }
        // files inside symlinks and others
      })
      // filter out null files
      .filter(Boolean)
  }

  return {
    path: path.basename(file),
    content: fs.createReadStream(file)
  }
}

function prepareFile (file, opts) {
  let files = [].concat(file)

  return flatmap(files, (file) => {
    if (typeof file === 'string') {
      if (!isNode) {
        throw new Error('Can not add paths in node')
      }

      return loadPaths(opts, file)
    }

    if (file.path && !file.content) {
      file.dir = true
      return file
    }

    if (file.path && (file.content || file.dir)) {
      return file
    }

    return {
      path: '',
      symlink: false,
      dir: false,
      content: file
    }
  })
}

exports = module.exports = prepareFile
