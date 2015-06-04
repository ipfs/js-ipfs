var Multipart = require('multipart-stream')
var Path = require('path')
var stream = require('stream')

module.exports = function MultipartDir (files) {
  if (files.length === 0) return null

  var root = {
    files: new Multipart(randomString()),
    folders: {}
  }

  for (var i = 0; i < files.length; i++) {
    addFile(root, files[i])
  }

  collapse(root)

  return root.files
}

function resolve (curr, path) {
  var prev
  path = path.split(Path.sep)

  if (path[0] === '') path.shift()

  while (curr && path.length) {
    prev = curr
    curr = curr.folders[path[0]]

    if (curr) path.shift()
  }

  return {
    curr: curr || prev,
    path: path
  }
}

function constructPath (curr, path) {
  while (path.length) {
    var folder = path.shift()
    curr.folders[folder] = {
      files: new Multipart(randomString()),
      folders: {}
    }

    curr = curr.folders[folder]
  }

  return curr
}

function addFile (root, file) {
  var relative = Path.relative(file.base, file.path)
  var relative_dir = Path.dirname(relative)
  var folder, info

  if (relative_dir === '.') relative_dir = ''

  info = resolve(root, relative_dir)

  if (info.path.length > 0) {
    folder = constructPath(info.curr, info.path)
  } else {
    folder = info.curr
  }

  if (file.isDirectory()) return

  folder.files.addPart({
    body: file.contents,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'file; name="file"; filename="' + relative + '"'
    }
  })
}

function collapse (curr, loc) {
  var key
  var folders = Object.keys(curr.folders)

  if (!loc) loc = ''
  for (var i = 0; i < folders.length; i++) {
    key = folders[i]
    collapse(curr.folders[key], loc + key + '/')

    if (!(curr.folders[key].files instanceof stream.Stream)) {
      return
    }

    curr.files.addPart({
      body: curr.folders[key].files,
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + curr.folders[key].files.boundary,
        'Content-Disposition': 'file; name="folder"; filename="' + loc + key + '"'
      }
    })
  }
}

function randomString () {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}
