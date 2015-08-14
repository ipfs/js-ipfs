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
      // add the file or dir itself
      adder.add(vinylfs.src(file, {buffer: false}))

      // if recursive, glob the contents
      if (opts.r || opts.recursive) {
        adder.add(vinylfs.src(file + '/**/*', {buffer: false}))
      }

    } else if (Buffer.isBuffer(file)) {
      single.push(new File({ cwd: '/', base: '/', path: '', contents: file }))
    } else if (file instanceof stream.Stream) {
      single.push(new File({ cwd: '/', base: '/', path: '', contents: file }))
    } else if (file instanceof File) {
      single.push(file)
    } else {
      return new Error('unable to process file' + file)
    }
  }

  single.end()
  return adder.pipe(vmps())
}
