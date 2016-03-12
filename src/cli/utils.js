const fs = require('fs')
const os = require('os')
const APIctl = require('ipfs-api')
const multiaddr = require('multiaddr')
const IPFS = require('../ipfs-core')
const debug = require('debug')
const log = debug('cli')
log.error = debug('cli:error')

exports = module.exports

const repoPath = process.env.IPFS_PATH || os.homedir() + '/.ipfs'

exports.isDaemonOn = isDaemonOn
function isDaemonOn () {
  try {
    fs.readFileSync(repoPath + '/api')
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

  const apiAddr = multiaddr(fs.readFileSync(repoPath + '/api').toString())
  return APIctl(apiAddr.toString())
}

exports.getIPFS = () => {
  if (!isDaemonOn()) {
    return new IPFS()
  }

  return getAPICtl()
}
