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
  if (!isDaemonOn()) {
    const ipfs = new IPFS(exports.getRepoPath())
    ipfs.load(() => {
      callback(null, ipfs)
    })
    return
  }

  callback(null, getAPICtl())
}

exports.help = function () {
  var keys = []
  for (var key in this.options) {
    var keyString = '['
    if (this.options.hasOwnProperty(key)) {
      if (this.options[key].alias) {
        keyString += '-' + this.options[key].alias + ' | '
      }
      keyString += `--` + key + ']'
      keys.push(keyString)
    }
  }

  return `USAGE:
  ipfs ${this.name} - ${this.desc}

SYNOPSIS:
  ipfs ${this.name} ${keys.join(' ')}
`;
}

exports.getRepoPath = () => {
  return process.env.IPFS_PATH || os.homedir() + '/.ipfs'
}
