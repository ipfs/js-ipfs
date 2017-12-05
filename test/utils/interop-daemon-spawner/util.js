'use strict'

const os = require('os')
const crypto = require('libp2p-crypto')
const path = require('path')
const hat = require('hat')

exports.tmpDir = (prefix) => {
  return path.join(
    os.tmpdir(),
    prefix || 'js-ipfs-interop',
    hat()
  )
}
