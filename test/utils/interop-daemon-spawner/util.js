'use strict'

const os = require('os')
const crypto = require('libp2p-crypto')
const path = require('path')

exports.tmpDir = (prefix) => {
  return path.join(
    os.tmpdir(),
    prefix || 'tmp',
    crypto.randomBytes(32).toString('hex')
  )
}
