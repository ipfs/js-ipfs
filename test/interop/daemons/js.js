'use strict'

const os = require('os')
const IPFSAPI = require('ipfs-api')
const series = require('async/series')
const rimraf = require('rimraf')

const IPFS = require('../../../src/core')
const HTTPAPI = require('../../../src/http-api')

class JsDaemon {
  constructor () {
    this.repoPath = os.tmpdir() + `${Math.ceil(Math.random() * 100)}`
    this.ipfs = new IPFS(this.repoPath)
    this.node = null
    this.api = null
  }

  start (callback) {
    console.log('starting js', this.repoPath)
    series([
      (cb) => this.ipfs.init(cb),
      (cb) => {
        this.node = new HTTPAPI(this.ipfs._repo)
        this.node.start(cb)
      },
      (cb) => {
        this.api = new IPFSAPI(this.node.apiMultiaddr)
        cb()
      }
    ], callback)
  }

  stop (callback) {
    series([
      (cb) => this.node.stop(cb),
      (cb) => rimraf(this.repoPath, cb)
    ], callback)
  }
}

module.exports = JsDaemon
