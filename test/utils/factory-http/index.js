'use strict'

const PeerId = require('peer-id')
const IPFSRepo = require('ipfs-repo')
const IPFSAPI = require('ipfs-api')
const IPFS = require('../../../src/core')
const cleanRepo = require('../clean')
const HTTPAPI = require('../../../src/http-api')
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
      const repo = new IPFSRepo(repoPath, {
        stores: require('fs-pull-blob-store')
      })
      repo.teardown = (done) => {
        cleanRepo(repoPath)
        done()
      }

      // create the IPFS node
      const ipfs = new IPFS(repo)
      ipfs.init({ emptyRepo: true, bits: 1024 }, (err) => {
        if (err) {
          return callback(err)
        }
        repo.config.set(config, launchNode)
      })

      function launchNode () {
        // create the IPFS node through the HTTP-API
        const node = new HTTPAPI(repo)
        nodes.push({
          httpApi: node,
          repo: repo
        })

        node.start((err) => {
          if (err) {
            return callback(err)
          }
          console.log(node.apiMultiaddr)
          const ctl = IPFSAPI(node.apiMultiaddr)
          callback(null, ctl)
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
      return node.httpApi.stop
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
