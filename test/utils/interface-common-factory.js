/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const IPFSApi = require('../../src')

function createFactory (options) {
  options = options || {}

  options.factoryOptions = options.factoryOptions || {}
  options.spawnOptions = options.spawnOptions || { initOptions: { bits: 1024 } }

  const ipfsFactory = IPFSFactory.create(options.factoryOptions)

  return function createCommon () {
    const nodes = []
    let setup, teardown

    if (options.createSetup) {
      setup = options.createSetup({ ipfsFactory, nodes }, options)
    } else {
      setup = (callback) => {
        callback(null, {
          spawnNode (cb) {
            ipfsFactory.spawn(options.spawnOptions, (err, _ipfsd) => {
              if (err) {
                return cb(err)
              }

              nodes.push(_ipfsd)
              cb(null, IPFSApi(_ipfsd.apiAddr))
            })
          }
        })
      }
    }

    if (options.createTeardown) {
      teardown = options.createTeardown({ ipfsFactory, nodes }, options)
    } else {
      teardown = callback => each(nodes, (node, cb) => node.stop(cb), callback)
    }

    return { setup, teardown }
  }
}

exports.create = createFactory
