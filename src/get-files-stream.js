'use strict'

const isNode = require('detect-node')
const Multipart = require('multipart-stream')
const flatmap = require('flatmap')
const escape = require('glob-escape')

function headers (file) {
  const name = file.path || ''
  const header = {
    'Content-Disposition': `file; filename="${name}"`
  }

  if (file.dir || !file.content) {
    header['Content-Type'] = 'application/x-directory'
  } else if (file.symlink) {
    header['Content-Type'] = 'application/symlink'
  } else {
    header['Content-Type'] = 'application/octet-stream'
  }

  return header
}

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
    const mg = new glob.sync.GlobSync(`${escape(file)}/**/*`, {
      follow: followSymlinks
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
        return
      })
      // filter out null files
      .filter(Boolean)
  }

  return {
    path: file,
    content: fs.createReadStream(file)
  }
}

function getFilesStream (files, opts) {
  if (!files) {
    return null
  }

  const mp = new Multipart()

  flatmap(files, (file) => {
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
  }).forEach((file) => {
    mp.addPart({
      headers: headers(file),
      body: file.content
    })
  })

  return mp
}

exports = module.exports = getFilesStream
