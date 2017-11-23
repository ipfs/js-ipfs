'use strict'

const PeerId = require('peer-id')
const IPFSAPI = require('ipfs-api')
const clean = require('../clean')
const HttpApi = require('../../../src/http')
const series = require('async/series')
const eachSeries = require('async/eachSeries')
const defaultConfig = require('./default-config.json')
const os = require('os')
const hat = require('hat')

class Factory {
  constructor () {
    this.daemonsSpawned = []
  }

  /* yields a new started node */
  spawnNode (repoPath, suppliedConfig, callback) {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof suppliedConfig === 'function') {
      callback = suppliedConfig
      suppliedConfig = {}
    }

    repoPath = repoPath || os.tmpdir() + '/ipfs-' + hat()

    let daemon
    let ctl
    let config

    series([
      (cb) => {
        // prepare config for node

        config = Object.assign({}, defaultConfig, suppliedConfig)

        PeerId.create({ bits: 1024 }, (err, id) => {
          if (err) { return cb(err) }

          const peerId = id.toJSON()
          config.Identity.PeerID = peerId.id
          config.Identity.PrivKey = peerId.privKey
          cb()
        })
      },
      (cb) => {
        daemon = new HttpApi(repoPath, config, {enablePubsubExperiment: true})
        daemon.repoPath = repoPath
        this.daemonsSpawned.push(daemon)

        daemon.start(true, cb)
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
    eachSeries(this.daemonsSpawned, (d, cb) => {
      d.stop((err) => {
        clean(d.repoPath)
        if (err) {
          console.error('error stopping', err)
        }
        cb(err)
      })
    }, callback)
  }
}

module.exports = Factory
