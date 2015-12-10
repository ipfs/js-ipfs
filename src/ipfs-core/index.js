// var ipfsAPIclt = require('ipfs-api')
// var extend = require('extend')
// var PeerId = require('peer-id')
// var PeerInfo = require('peer-info')
var config = require('./config')
var IPFSRepo = require('ipfs-repo')

exports = module.exports = IPFS
exports.config = config

function IPFS () {
  var self = this

  if (!(self instanceof IPFS)) {
    throw new Error('Must be instantiated with new')
  }

  var opts = {
    url: 'public-writable-node'
  }

  if (process.env.NODE_ENV === 'dev') {
    opts.url = '/ip4/127.0.0.1/tcp/5001'
  }

  if (process.env.NODE_ENV === 'test') {
    opts.url = process.env.APIURL
  }

  // var api = ipfsAPIclt(config.url)
  // extend(self, api)

  var repo = new IPFSRepo(config.repoPath)

  self.daemon = function (callback) {
    // 1. read repo to get peer data
  }

  self.version = function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts
      opts = {}
    }

    if (!repo.exists()) {
      callback(new Error('Repo does not exist, you must init repo first'))
    } else { repo.load() }

    repo.config.read(function (err, config) {
      if (err) {
        return callback(err)
      }
      callback(null, config.Version.Current)
    })
  }

  self.id = function (format, callback) {}

  self.repo = {
    init: function (bits, force, empty, callback) {
      // 1. check if repo already exists
    },

    version: function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts
        opts = {}
      }
      if (!repo.exists()) {
        callback(new Error('Repo does not exist, you must init repo first'))
      } else { repo.load() }

      repo.version.read(callback)
    },

    gc: function () {}
  }
}
