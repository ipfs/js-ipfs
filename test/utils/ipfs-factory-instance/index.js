'use strict'

const series = require('async/series')
const each = require('async/each')

const defaultConfig = require('./default-config.json')
const IPFS = require('../../../src/core')
const createTempRepo = require('../create-repo-nodejs')

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

    config = config || defaultConfig

    const repo = createTempRepo(repoPath)
    const node = new IPFS({
      repo: repo,
      init: {
        bits: 1024
      },
      config: config,
      EXPERIMENTAL: {
        pubsub: true,
        dht: true
      }
    })

    node.once('ready', () => {
      nodes.push({
        repo: repo,
        ipfs: node
      })
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
