'use strict'

// const defaultConfig = require('./default-config.json')
const ipfsd = require('ipfsd-ctl')
const series = require('run-series')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }

  const nodes = []

  this.spawnNode = (repoPath, config, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    // if (!repoPath) {
    //   repoPath = '/tmp/.ipfs-' + Math.random()
    //                             .toString()
    //                             .substring(2, 8)
    // }

    // TODO
    //   - [ ] Support custom repoPath
    //   - [ ] Support custom config
    // This will come once the new ipfsd-ctl is
    // complete: https://github.com/ipfs/js-ipfsd-ctl/pull/89

    spawnEphemeralNode((err, node) => {
      if (err) {
        return callback(err)
      }
      nodes.push(node)
      callback(null, node.apiAddr)
    })
  }

  this.dismantle = function (callback) {
    series(
      nodes.map((node) => {
        return node.stopDaemon
      }), callback)
  }
}

function spawnEphemeralNode (callback) {
  ipfsd.disposable((err, node) => {
    if (err) {
      return callback(err)
    }
    // Note: we have to set each config value
    // independently since the config/replace endpoint
    // doesn't work as expected
    series([
      (cb) => {
        node.setConfig('Bootstrap', null, cb)
      },
      (cb) => {
        node.setConfig('Discovery', '{}', cb)
      },
      (cb) => {
        const headers = {
          HTTPHeaders: {
            'Access-Control-Allow-Origin': ['*']
          }
        }
        node.setConfig('API', JSON.stringify(headers), cb)
      },
      (cb) => {
        node.startDaemon(cb)
      }
    ], (err) => {
      if (err) {
        return callback(err)
      }

      callback(null, node)
    })
  })
}
