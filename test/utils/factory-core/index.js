'use strict'

const PeerId = require('peer-id')
const isNode = require('detect-node')
const IPFSRepo = require('ipfs-repo')
const cleanRepo = require('../clean')
const IPFS = require('../../../src/core')
const series = require('async/series')
const defaultConfig = require('./default-config.json')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }

  const nodes = []

  /* yields a new started node */
  this.spawnNode = (repoPath, config, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    if (!repoPath) {
      repoPath = '/tmp/.ipfs-' + Math.random()
                                 .toString()
                                 .substring(2, 8)
    }

    createConfig(config, (err, conf) => {
      if (err) {
        return callback(err)
      }

      config = conf

      // set up the repo
      let store
      let teardown

      if (isNode) {
        store = require('fs-pull-blob-store')
        teardown = (done) => {
          cleanRepo(repoPath)
          done()
        }
      } else {
        const idb = window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB
        store = require('idb-pull-blob-store')
        teardown = (done) => {
          idb.deleteDatabase(repoPath)
          idb.deleteDatabase(repoPath + '/blocks')
          done()
        }
      }

      const repo = new IPFSRepo(repoPath, { stores: store })
      repo.teardown = teardown

      // create the IPFS node
      const ipfs = new IPFS(repo)
      ipfs.init({ emptyRepo: true, bits: 1024 }, (err) => {
        if (err) {
          return callback(err)
        }
        repo.config.set(config, launchNode)
      })

      function launchNode () {
        ipfs.load((err) => {
          if (err) {
            return callback(err)
          }

          ipfs.goOnline((err) => {
            if (err) {
              return callback(err)
            }

            nodes.push({
              repo: repo,
              ipfs: ipfs
            })

            callback(null, ipfs)
          })
        })
      }
    })

    function createConfig (config, cb) {
      if (config) {
        return cb(null, config)
      }
      const conf = JSON.parse(JSON.stringify(defaultConfig))

      PeerId.create({ bits: 1024 }, (err, id) => {
        if (err) {
          return cb(err)
        }

        const pId = id.toJSON()
        conf.Identity.PeerID = pId.id
        conf.Identity.PrivKey = pId.privKey
        cb(null, conf)
      })
    }
  }

  this.dismantle = function (callback) {
    series(nodes.map((node) => {
      return node.ipfs.goOffline
    }), clean)

    function clean (err) {
      if (err) {
        return callback(err)
      }
      series(
        nodes.map((node) => {
          return node.repo.teardown
        }),
        callback
      )
    }
  }
}
