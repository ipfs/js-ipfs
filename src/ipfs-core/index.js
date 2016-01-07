'use strict'

const config = require('./config')
const IPFSRepo = require('ipfs-repo')

exports = module.exports = IPFS
exports.config = config

function IPFS () {
  if (!(this instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  var repo = new IPFSRepo(config.repoPath)

  this.daemon = callback => {
    // 1. read repo to get peer data
  }

  this.version = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    repo.exists((err, exists) => {
      if (err) { return callback(err) }

      repo.config.get((err, config) => {
        if (err) { return callback(err) }

        callback(null, config.Version.Current)
      })
    })
  }

  this.id = (opts, callback) => {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    repo.exists((err, exists) => {
      if (err) { return callback(err) }

      repo.config.read((err, config) => {
        if (err) {
          return callback(err)
        }
        callback(null, {
          ID: config.Identity.PeerID,
          // TODO needs https://github.com/diasdavid/js-peer-id/blob/master/src/index.js#L76
          PublicKey: '',
          Addresses: config.Addresses,
          AgentVersion: 'js-ipfs',
          ProtocolVersion: '9000'
        })
      })
    })
  }

  this.repo = {
    init: (bits, force, empty, callback) => {
      // 1. check if repo already exists
    },

    version: (opts, callback) => {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      repo.exists((err, res) => {
        if (err) { return callback(err) }
        repo.version.read(callback)
      })
    },

    gc: function () {}
  }
}
