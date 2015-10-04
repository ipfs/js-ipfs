var File = require('vinyl')
var vinylfs = require('vinyl-fs-browser')
var vmps = require('vinyl-multipart-stream')
var stream = require('stream')
var Merge = require('merge-stream')

exports = module.exports = getFilesStream

function getFilesStream (files, opts) {
  if (!files) return null
  if (!Array.isArray(files)) files = [files]

  // merge all inputs into one stream
  var adder = new Merge()

  // single stream for pushing directly
  var single = new stream.PassThrough({objectMode: true})
  adder.add(single)

  for (var i = 0; i < files.length; i++) {
    var file = files[i]

    if (typeof (file) === 'string') {
      var srcOpts = {
        buffer: false,
        stripBOM: false,
        followSymlinks: opts.followSymlinks != null ? opts.followSymlinks : true
      }

      // add the file or dir itself
      adder.add(vinylfs.src(file, srcOpts))

      // if recursive, glob the contents
      if (opts.r || opts.recursive) {
        adder.add(vinylfs.src(file + '/**/*', srcOpts))
      }
    } else {
      // try to create a single vinyl file, and push it.
      // throws if cannot use the file.
      single.push(vinylFile(file))
    }
  }

  single.end()
  return adder.pipe(vmps())
}

// vinylFile tries to cast a file object to a vinyl file.
// it's agressive. If it _cannot_ be converted to a file,
// it returns null.
function vinylFile (file) {
  if (file instanceof File) {
    return file // it's a vinyl file.
  }

  // let's try to make a vinyl file?
  var f = {cwd: '/', base: '/', path: ''}
  if (file.contents && file.path) {
    // set the cwd + base, if there.
    f.path = file.path
    f.cwd = file.cwd || f.cwd
    f.base = file.base || f.base
    f.contents = file.contents
  } else {
    // ok maybe we just have contents?
    f.contents = file
  }

  // ensure the contents are safe to pass.
  // throws if vinyl cannot use the contents
  f.contents = vinylContentsSafe(f.contents)
  return new File(f)
}

function vinylContentsSafe (c) {
  if (Buffer.isBuffer(c)) return c
  if (typeof (c) === 'string') return c
  if (c instanceof stream.Stream) return c
  if (typeof (c.pipe) === 'function') {
    // hey, looks like a stream. but vinyl won't detect it.
    // pipe it to a PassThrough, and use that
    var s = new stream.PassThrough()
    return c.pipe(s)
  }

  throw new Error('vinyl will not accept: ' + c)
}
