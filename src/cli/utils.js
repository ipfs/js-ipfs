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

// All known IPLD formats
const ipldBitcoin = require('ipld-bitcoin')
const ipldDagCbor = require('ipld-dag-cbor')
const ipldDagPb = require('ipld-dag-pb')
const ipldEthAccountSnapshot = require('ipld-ethereum').ethAccountSnapshot
const ipldEthBlock = require('ipld-ethereum').ethBlock
const ipldEthBlockList = require('ipld-ethereum').ethBlockList
const ipldEthStateTrie = require('ipld-ethereum').ethStateTrie
const ipldEthStorageTrie = require('ipld-ethereum').ethStorageTrie
const ipldEthTrie = require('ipld-ethereum').ethTxTrie
const ipldEthTx = require('ipld-ethereum').ethTx
const ipldGit = require('ipld-git')
const ipldRaw = require('ipld-raw')
const ipldZcash = require('ipld-zcash')

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
  // Required inline to reduce startup time
  const APIctl = require('ipfs-api')
  return APIctl(apiAddr)
}

exports.getIPFS = (argv, callback) => {
  if (argv.api || isDaemonOn()) {
    return callback(null, getAPICtl(argv.api), promisify((cb) => cb()))
  }

  // Required inline to reduce startup time
  const IPFS = require('../core')
  const node = new IPFS({
    repo: exports.getRepoPath(),
    init: false,
    start: false,
    pass: argv.pass,
    EXPERIMENTAL: {
      pubsub: true
    }
  })

  const cleanup = promisify((cb) => {
    if (node && node._repo && !node._repo.closed) {
      node._repo.close((err) => cb(err))
    } else {
      cb()
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

exports.ipfsPathHelp = 'ipfs uses a repository in the local file system. By default, the repo is ' +
  'located at ~/.jsipfs. To change the repo location, set the $IPFS_PATH environment variable:\n\n' +
  'export IPFS_PATH=/path/to/ipfsrepo\n'
