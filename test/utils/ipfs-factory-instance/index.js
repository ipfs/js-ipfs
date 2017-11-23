'use strict'

const series = require('async/series')
const each = require('async/each')
const hat = require('hat')

const defaultConfig = require('./default-config.json')
const IPFS = require('../../../src/core')
const createTempRepo = require('../create-repo-nodejs')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }

  const nodes = []

  /* yields a new started node instance */
  this.spawnNode = (repoPath, suppliedConfig, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }

    if (typeof suppliedConfig === 'function') {
      callback = suppliedConfig
      suppliedConfig = {}
    }

    if (!repoPath) {
      repoPath = '/tmp/.ipfs-' + hat()
    }

    const config = Object.assign({}, defaultConfig, suppliedConfig)

    const repo = createTempRepo(repoPath)
    const node = new IPFS({
      repo: repo,
      init: { bits: 1024 },
      config: config,
      EXPERIMENTAL: {
        pubsub: true,
        dht: true
      }
    })

    node.once('ready', () => {
      nodes.push({ repo: repo, ipfs: node })
      callback(null, node)
    })
  }

  this.dismantle = function (callback) {
    series([
      (cb) => each(nodes, (el, cb) => el.ipfs.stop(cb), cb),
      (cb) => each(nodes, (el, cb) => el.repo.teardown(cb), cb)
    ], callback)
  }
}
