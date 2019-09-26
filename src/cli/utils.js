'use strict'

const fs = require('fs')
const os = require('os')
const multiaddr = require('multiaddr')
const path = require('path')
const debug = require('debug')
const log = debug('cli')
log.error = debug('cli:error')
const Progress = require('progress')
const byteman = require('byteman')
const promisify = require('promisify-es6')
const callbackify = require('callbackify')

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
  // Required inline to reduce startup time
  const APIctl = require('ipfs-http-client')
  return APIctl(apiAddr)
}

exports.getIPFS = (argv, callback) => {
  if (argv.api || isDaemonOn()) {
    return callback(null, getAPICtl(argv.api), promisify((cb) => cb()))
  }

  // Required inline to reduce startup time
  const IPFS = require('../core')
  const node = new IPFS({
    silent: argv.silent,
    repo: exports.getRepoPath(),
    init: false,
    start: false,
    pass: argv.pass
  })

  const cleanup = callbackify(async () => {
    if (node && node._repo && !node._repo.closed) {
      await node._repo.close()
    }
  })

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

exports.print = (msg, newline, isError = false) => {
  if (newline === undefined) {
    newline = true
  }

  if (visible) {
    if (msg === undefined) {
      msg = ''
    }
    msg = newline ? msg + '\n' : msg
    const outStream = isError ? process.stderr : process.stdout
    outStream.write(msg)
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

exports.ipfsPathHelp = 'ipfs uses a repository in the local file system. By default, the repo is ' +
  'located at ~/.jsipfs. To change the repo location, set the $IPFS_PATH environment variable:\n\n' +
  'export IPFS_PATH=/path/to/ipfsrepo\n'

exports.singleton = create => {
  const requests = []
  const getter = promisify(cb => {
    if (getter.instance) return cb(null, getter.instance, ...getter.rest)
    requests.push(cb)
    if (requests.length > 1) return
    create((err, instance, ...rest) => {
      getter.instance = instance
      getter.rest = rest
      while (requests.length) requests.pop()(err, instance, ...rest)
    })
  })
  return getter
}
