'use strict'

const ipfsd = require('ipfsd-ctl')
const series = require('async/series')
const eachSeries = require('async/eachSeries')
const once = require('once')

module.exports = Factory

function Factory () {
  if (!(this instanceof Factory)) {
    return new Factory()
  }

  let nodes = []

  this.spawnNode = (repoPath, config, callback) => {
    if (typeof repoPath === 'function') {
      callback = repoPath
      repoPath = undefined
    }
    if (typeof config === 'function') {
      callback = config
      config = undefined
    }

    // TODO
    // support custom repoPath
    // support custom configs being passed

    spawnEphemeralNode((err, node) => {
      if (err) {
        return callback(err)
      }

      nodes.push(node)

      callback(null, node.apiAddr)
    })
  }

  this.dismantle = (callback) => {
    eachSeries(nodes, (node, cb) => {
      cb = once(cb)
      node.stopDaemon(cb)
    }, (err) => {
      if (err) {
        return callback(err)
      }

      nodes = []

      callback()
    })
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
        const configValues = {
          Bootstrap: [],
          Discovery: {},
          'API.HTTPHeaders.Access-Control-Allow-Origin': ['*'],
          // This is not needed after all
          // 'API.HTTPHeaders.Access-Control-Allow-Credentials': true,
          'API.HTTPHeaders.Access-Control-Allow-Methods': [
            'PUT',
            'POST',
            'GET'
          ]
        }

        eachSeries(Object.keys(configValues), (configKey, cb) => {
          const configVal = JSON.stringify(configValues[configKey])
          node.setConfig(configKey, configVal, cb)
        }, cb)
      },
      (cb) => node.startDaemon(['--enable-pubsub-experiment'], cb)
    ], (err) => callback(err, node))
  })
}
