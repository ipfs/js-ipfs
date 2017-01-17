'use strict'

const os = require('os')
const IPFSAPI = require('ipfs-api')
const series = require('async/series')
const rimraf = require('rimraf')
const IPFSRepo = require('ipfs-repo')

const IPFS = require('../../../src/core')
const HTTPAPI = require('../../../src/http-api')

function setPorts (ipfs, port, callback) {
  series([
    (cb) => ipfs.config.set(
      'Addresses.Gateway',
      '/ip4/127.0.0.1/tcp/' + (9090 + port),
      cb
    ),
    (cb) => ipfs.config.set(
      'Addresses.API',
      '/ip4/127.0.0.1/tcp/' + (5002 + port),
      cb
    ),
    (cb) => ipfs.config.set(
      'Addresses.Swarm',
      ['/ip4/0.0.0.0/tcp/' + (4002 + port)],
      cb
    )
  ], callback)
}

class JsDaemon {
  constructor (opts) {
    opts = Object.assign({}, {
      disposable: true,
      init: true
    }, opts || {})

    this.path = opts.path
    this.disposable = opts.disposable
    this.init = opts.init
    this.port = opts.port

    this.path = opts.path || os.tmpdir() + `/${Math.ceil(Math.random() * 10000)}`
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
      (cb) => this.ipfs.config.set('Bootstrap', [], cb),
      (cb) => {
        if (this.port) {
          console.log('setting to port', this.port)
          setPorts(this.ipfs, this.port, cb)
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
