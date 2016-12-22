'use strict'

const os = require('os')
const IPFSAPI = require('ipfs-api')
const series = require('async/series')
const rimraf = require('rimraf')
const IPFSRepo = require('ipfs-repo')

const IPFS = require('../../../src/core')
const HTTPAPI = require('../../../src/http-api')

class JsDaemon {
  constructor (opts) {
    opts = opts || {
      disposable: true,
      init: true
    }

    this.path = opts.path
    this.disposable = opts.disposable
    this.init = opts.init

    this.path = opts.path || os.tmpdir() + `/${Math.ceil(Math.random() * 1000)}`
    if (this.init) {
      this.ipfs = new IPFS(this.path)
    } else {
      const repo = new IPFSRepo(this.path, {stores: require('fs-pull-blob-store')})
      this.ipfs = new IPFS(repo)
    }
    this.node = null
    this.api = null
  }

  start (callback) {
    console.log('starting js', this.path)
    series([
      (cb) => {
        if (this.init) {
          this.ipfs.init(cb)
        } else {
          cb()
        }
      },
      (cb) => {
        this.node = new HTTPAPI(this.ipfs._repo)
        this.node.start(cb)
      },
      (cb) => {
        this.api = new IPFSAPI(this.node.apiMultiaddr)
        cb()
      }
    ], (err) => callback(err))
  }

  stop (callback) {
    series([
      (cb) => this.node.stop(cb),
      (cb) => {
        if (this.disposable) {
          rimraf(this.path, cb)
        } else {
          cb()
        }
      }
    ], (err) => callback(err))
  }
}

module.exports = JsDaemon
