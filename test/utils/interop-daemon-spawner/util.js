'use strict'

const os = require('os')
const path = require('path')
const hat = require('hat')

exports.tmpDir = (prefix) => {
  return path.join(os.tmpdir(), prefix || 'js-ipfs-interop', hat())
}
