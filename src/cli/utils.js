const fs = require('fs')
const os = require('os')
const APIctl = require('ipfs-api')
const multiaddr = require('multiaddr')
const IPFS = require('../core')
const debug = require('debug')
const log = debug('cli')
log.error = debug('cli:error')

exports = module.exports

exports.isDaemonOn = isDaemonOn
function isDaemonOn () {
  try {
    fs.readFileSync(exports.getRepoPath() + '/api')
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

  const apiAddr = multiaddr(fs.readFileSync(exports.getRepoPath() + '/api').toString())
  return APIctl(apiAddr.toString())
}

exports.getIPFS = (callback) => {
  if (!isDaemonOn()) {
    const ipfs = new IPFS()
    ipfs.load(() => {
      callback(null, ipfs)
    })
    return
  }

  callback(null, getAPICtl())
}

exports.getRepoPath = () => {
  return process.env.IPFS_PATH || os.homedir() + '/.ipfs'
}
