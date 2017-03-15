'use strict'

const PeerId = require('peer-id')
const IPFSAPI = require('ipfs-api')
const IPFS = require('../../../src/core')
const clean = require('../clean')
const HTTPAPI = require('../../../src/http-api')
const series = require('async/series')
const defaultConfig = require('./default-config.json')
const os = require('os')

class Factory {
  constructor () {
    this.daemonsSpawned = []
  }

  /* yields a new started node */
  spawnNode (repoPath, config, callback) {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    repoPath = repoPath ||
      os.tmpdir() + '/ipfs-' + Math.random().toString().substring(2, 8)

    let daemon
    let ctl

    series([
      (cb) => {
        // prepare config for node
        if (config) {
          return cb()
        }

        config = JSON.parse(JSON.stringify(defaultConfig))

        PeerId.create({ bits: 1024 }, (err, id) => {
          if (err) {
            return cb(err)
          }

          const peerId = id.toJSON()
          config.Identity.PeerID = peerId.id
          config.Identity.PrivKey = peerId.privKey
          cb()
        })
      },
      (cb) => {
        // create the node
        IPFS.createNode({
          repo: repoPath,
          start: false,
          config: config,
          EXPERIMENTAL: {
            pubsub: true
          }
        })

        setTimeout(cb, 400)
      },
      (cb) => {
        // create the daemon
        daemon = new HTTPAPI(repoPath)
        daemon.repoPath = repoPath
        this.daemonsSpawned.push(daemon)

        daemon.start(cb)
      },
      (cb) => {
        ctl = IPFSAPI(daemon.apiMultiaddr)
        ctl.repoPath = repoPath
        ctl.apiMultiaddr = daemon.apiMultiaddr
        cb()
      }
    ], (err) => callback(err, ctl))
  }

  dismantle (callback) {
    const tasks = this.daemonsSpawned.map((daemon) => (cb) => {
      daemon.stop((err) => {
        if (err) {
          return cb(err)
        }
        clean(daemon.repoPath)
        cb()
      })
    })

    series(tasks, callback)
  }
}

module.exports = Factory
