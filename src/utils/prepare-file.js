'use strict'

const isNode = require('detect-node')
const flatmap = require('flatmap')

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
    const fullDir = file + (file.endsWith('/') ? '' : '/')
    let dirName = fullDir.split('/')
    dirName = dirName[dirName.length - 2] + '/'
    const mg = new glob.sync.GlobSync('**/*', {
      cwd: file,
      follow: followSymlinks,
      dot: opts.hidden,
      ignore: opts.ignore
    })

    return mg.found
      .map((name) => {
        const fqn = fullDir + name
        // symlinks
        if (mg.symlinks[fqn] === true) {
          return {
            path: dirName + name,
            symlink: true,
            dir: false,
            content: fs.readlinkSync(fqn)
          }
        }

        // files
        if (mg.cache[fqn] === 'FILE') {
          return {
            path: dirName + name,
            symlink: false,
            dir: false,
            content: fs.createReadStream(fqn)
          }
        }

        // directories
        if (mg.cache[fqn] === 'DIR' || mg.cache[fqn] instanceof Array) {
          return {
            path: dirName + name,
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
        throw new Error('Can only add file paths in node')
      }

      return loadPaths(opts, file)
    }

    if (file.path && !file.content) {
      file.dir = true
      return file
    }

    if (file.content || file.dir) {
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
