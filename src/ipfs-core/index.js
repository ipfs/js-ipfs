var config = require('./config')
var IPFSRepo = require('ipfs-repo')

exports = module.exports = IPFS
exports.config = config

function IPFS () {
  var self = this

  if (!(self instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  var repo = new IPFSRepo(config.repoPath)

  self.daemon = function (callback) {
    // 1. read repo to get peer data
  }

  self.version = function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    repo.exists(function (err, exists) {
      if (err) { return callback(err) }

      repo.config.get(function (err, config) {
        if (err) { return callback(err) }

        callback(null, config.Version.Current)
      })
    })
  }

  self.id = function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }
    repo.exists(function (err, exists) {
      if (err) {
        return callback(err)
      }

      repo.config.read(function (err, config) {
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

  self.repo = {
    init: function (bits, force, empty, callback) {
      // 1. check if repo already exists
    },

    version: function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      repo.exists(function (err, res) {
        if (err) {
          return callback(err)
        }
        repo.version.read(callback)
      })
    },

    gc: function () {}
  }
}
