'use strict'

module.exports = (args) => {
  const callback = args.pop()
  let opts = {}
  let sources = []

  if (!Array.isArray(args[args.length - 1]) && typeof args[args.length - 1] === 'object') {
    opts = args.pop()
  }

  if (args.length === 1 && Array.isArray(args[0])) {
    // support ipfs.file.cp([src, dest], opts, cb)
    sources = args[0]
  } else {
    // support ipfs.file.cp(src, dest, opts, cb) and ipfs.file.cp(src1, src2, dest, opts, cb)
    sources = args
  }

  return {
    callback,
    sources,
    opts
  }
}
