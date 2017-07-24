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
function getAPICtl () {
  if (!isDaemonOn()) {
    throw new Error('daemon is not on')
  }
  const apiPath = path.join(exports.getRepoPath(), 'api')
  const apiAddr = multiaddr(fs.readFileSync(apiPath).toString())
  return APIctl(apiAddr.toString())
}

exports.getIPFS = (callback) => {
  if (isDaemonOn()) {
    return callback(null, getAPICtl(), (cb) => cb())
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

exports.printLevel = 1

exports.print = (msg, options) => {
  msg = msg || ''
  if (typeof options === 'boolean') { options = { newline: options } }
  options = Object.assign({ newline: true, printLevel: 1 }, options || {})

  if (options.printLevel <= exports.printLevel) {
    msg = options.newline ? msg + '\n' : msg
    process.stdout.write(msg)
  }
}
