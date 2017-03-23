'use strict'

const PeerId = require('peer-id')
const series = require('async/series')
const each = require('async/each')

const defaultConfig = require('./default-config.json')
const IPFS = require('../../../src/core')
const createTempRepo = require('../create-repo-node')

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

    createConfig(config, (err, config) => {
      if (err) {
        return callback(err)
      }

      // create the IPFS node
      const repo = createTempRepo(repoPath)
      const node = new IPFS({
        repo: repo,
        config: config,
        EXPERIMENTAL: {
          pubsub: true
        }
      })

      node.once('start', () => {
        nodes.push({ repo: repo, ipfs: node })
        callback(null, node)
      })
    })

    function createConfig (config, cb) {
      if (config) {
        return cb(null, config)
      }

      config = JSON.parse(JSON.stringify(defaultConfig))

      PeerId.create({ bits: 1024 }, (err, id) => {
        if (err) {
          return cb(err)
        }

        const pId = id.toJSON()
        config.Identity.PeerID = pId.id
        config.Identity.PrivKey = pId.privKey
        cb(null, config)
      })
    }
  }

  this.dismantle = function (callback) {
    series([
      (cb) => each(nodes, (el, cb) => el.ipfs.stop(cb), cb),
      (cb) => each(nodes, (el, cb) => el.repo.teardown(cb), cb)
    ], callback)
  }
}
