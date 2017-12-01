'use strict'

const fs = require('fs')
const os = require('os')
const APIctl = require('ipfs-api')
const multiaddr = require('multiaddr')
const IPFS = require('../core')
const path = require('path')
const debug = require('debug')
const log = debug('cli')
log.error = debug('cli:error')
const Progress = require('progress')
const byteman = require('byteman')

exports = module.exports

exports.isDaemonOn = isDaemonOn
function isDaemonOn () {
  try {
    fs.readFileSync(path.join(exports.getRepoPath(), 'api'))
    log('daemon is on')
    return true
  } catch (err) {
    log('daemon is off')
    return false
  }
}

exports.getAPICtl = getAPICtl
function getAPICtl (apiAddr) {
  if (!apiAddr && !isDaemonOn()) {
    throw new Error('daemon is not on')
  }
  if (!apiAddr) {
    const apiPath = path.join(exports.getRepoPath(), 'api')
    apiAddr = multiaddr(fs.readFileSync(apiPath).toString()).toString()
  }
  return APIctl(apiAddr)
}

exports.getIPFS = (apiAddr, callback) => {
  if (apiAddr || isDaemonOn()) {
    return callback(null, getAPICtl(apiAddr), (cb) => cb())
  }

  const node = new IPFS({
    repo: exports.getRepoPath(),
    init: false,
    start: false,
    EXPERIMENTAL: {
      pubsub: true
    }
  })

  const cleanup = (cb) => {
    if (node && node._repo && !node._repo.closed) {
      node._repo.close(() => cb())
    } else {
      cb()
    }
  }

  node.on('error', (err) => {
    throw err
  })

  node.once('ready', () => {
    callback(null, node, cleanup)
  })
}

exports.getRepoPath = () => {
  return process.env.IPFS_PATH || os.homedir() + '/.jsipfs'
}

let visible = true
exports.disablePrinting = () => { visible = false }

exports.print = (msg, newline) => {
  if (newline === undefined) {
    newline = true
  }

  if (visible) {
    if (msg === undefined) {
      msg = ''
    }
    msg = newline ? msg + '\n' : msg
    process.stdout.write(msg)
  }
}

exports.createProgressBar = (totalBytes) => {
  const total = byteman(totalBytes, 2, 'MB')
  const barFormat = `:progress / ${total} [:bar] :percent :etas`

  // 16 MB / 34 MB [===========             ] 48% 5.8s //
  return new Progress(barFormat, {
    incomplete: ' ',
    clear: true,
    stream: process.stdout,
    total: totalBytes
  })
}

exports.rightpad = (val, n) => {
  let result = String(val)
  for (let i = result.length; i < n; ++i) {
    result += ' '
  }
  return result
}
