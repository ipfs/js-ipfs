'use strict'

const fs = require('fs')
const os = require('os')
const path = require('path')
const log = require('debug')('ipfs:cli:utils')
const Progress = require('progress')
const byteman = require('byteman')
const IPFS = require('../core/index')

const getRepoPath = () => {
  return process.env.IPFS_PATH || path.join(os.homedir(), '/.jsipfs')
}

const isDaemonOn = () => {
  try {
    fs.readFileSync(path.join(getRepoPath(), 'api'))
    log('daemon is on')
    return true
  } catch (err) {
    log('daemon is off')
    return false
  }
}

let visible = true
const disablePrinting = () => { visible = false }

const print = (msg, newline, isError = false) => {
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

const createProgressBar = (totalBytes) => {
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

const rightpad = (val, n) => {
  let result = String(val)
  for (let i = result.length; i < n; ++i) {
    result += ' '
  }
  return result
}

const ipfsPathHelp = 'ipfs uses a repository in the local file system. By default, the repo is ' +
  'located at ~/.jsipfs. To change the repo location, set the $IPFS_PATH environment variable:\n\n' +
  'export IPFS_PATH=/path/to/ipfsrepo\n'

async function getAPI (argv) {
  let endpoint = null
  if (!argv.api && !isDaemonOn()) {
    const api = await IPFS.create({
      silent: argv.silent,
      repoAutoMigrate: argv.migrate,
      repo: getRepoPath(),
      init: false,
      start: false,
      pass: argv.pass
    })
    return {
      daemon: false,
      api,
      cleanup: async () => {
        if (api && api._repo && !api._repo.closed) {
          await api._repo.close()
        }
      }
    }
  }

  if (!argv.api) {
    const apiPath = path.join(getRepoPath(), 'api')
    endpoint = fs.readFileSync(apiPath).toString()
  } else {
    endpoint = argv.api
  }
  // Required inline to reduce startup time
  const APIctl = require('ipfs-http-client')
  return {
    daemon: true,
    api: APIctl(endpoint),
    cleanup: async () => { }
  }
}

module.exports = {
  getAPI,
  isDaemonOn,
  getRepoPath,
  disablePrinting,
  print,
  createProgressBar,
  rightpad,
  ipfsPathHelp
}
