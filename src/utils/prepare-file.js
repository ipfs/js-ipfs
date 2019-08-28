'use strict'

const isNode = require('detect-node')
const flatmap = require('flatmap')
const { Readable } = require('readable-stream')
const kindOf = require('kind-of')
const { isSource } = require('is-pull-stream')
const isStream = require('is-stream')
const pullToStream = require('pull-to-stream')
const { supportsFileReader } = require('ipfs-utils/src/supports')
const streamFromFileReader = require('ipfs-utils/src/streams/stream-from-filereader')

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

function contentToStream (content) {
  if (supportsFileReader && kindOf(content) === 'file') {
    return streamFromFileReader(content)
  }

  if (kindOf(content) === 'buffer') {
    return new Readable({
      read () {
        this.push(content)
        this.push(null)
      }
    })
  }

  if (isSource(content)) {
    return pullToStream.readable(content)
  }

  if (isStream.readable(content)) {
    return content
  }

  throw new Error(`Input not supported. Expected Buffer|ReadableStream|PullStream|File got ${kindOf(content)}. Check the documentation for more info https://github.com/ipfs/interface-js-ipfs-core/blob/master/SPEC/FILES.md#add`)
}

function prepareFile (file, opts) {
  const files = [].concat(file)

  return flatmap(files, (file) => {
    // add from fs with file path
    if (typeof file === 'string') {
      if (!isNode) {
        throw new Error('Can only add file paths in node')
      }

      return loadPaths(opts, file)
    }

    // add with object syntax { path : <string> , content: <Buffer|ReadableStream|PullStream|File }
    if (kindOf(file) === 'object') {
      // treat as an empty directory when path is a string and content undefined
      if (file.path && kindOf(file.path) === 'string' && !file.content) {
        file.dir = true
        return file
      }

      // just return when directory
      if (file.dir) {
        return file
      }

      if (file.content) {
        return {
          path: file.path || '',
          symlink: false,
          dir: false,
          content: contentToStream(file.content)
        }
      }
    }

    return {
      path: '',
      symlink: false,
      dir: false,
      content: contentToStream(file)
    }
  })
}

exports = module.exports = prepareFile
