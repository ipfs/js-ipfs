'use strict'

exports.findSources = (args) => {
  /** @type {Record<any, any>} */
  let options = {}
  let sources = []

  if (!Array.isArray(args[args.length - 1]) && typeof args[args.length - 1] === 'object') {
    options = args.pop()
  }

  if (args.length === 1 && Array.isArray(args[0])) {
    // support ipfs.files.cp([src, dest], opts)
    sources = args[0]
  } else {
    // support ipfs.files.cp(src, dest, opts) and ipfs.files.cp(src1, src2, dest, opts)
    sources = args
  }

  return {
    sources,
    options
  }
}
