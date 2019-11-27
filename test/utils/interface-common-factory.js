/* eslint-env mocha */
'use strict'

const each = require('async/each')
const IPFSFactory = require('ipfsd-ctl')
const ipfsClient = require('../../src')
const merge = require('merge-options')

const DEFAULT_FACTORY_OPTIONS = {
  IpfsClient: ipfsClient
}

function createFactory (options) {
  options = options || {}

  options.factoryOptions = options.factoryOptions || { ...DEFAULT_FACTORY_OPTIONS }
  options.spawnOptions = options.spawnOptions || { initOptions: { bits: 1024, profile: 'test' } }

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
            ipfsFactory.spawn(options.spawnOptions)
              .then((ipfsd) => {
                nodes.push(ipfsd)
                setImmediate(() => cb(null, ipfsd.api))
              })
              .catch(err => {
                setImmediate(() => cb(err))
              })
          }
        })
      }
    }

    if (options.createTeardown) {
      teardown = options.createTeardown({ ipfsFactory, nodes }, options)
    } else {
      teardown = callback => each(nodes, (node, cb) => {
        node
          .stop()
          .then(() => setImmediate(() => cb()))
          .catch(err => setImmediate(() => cb(err)))
      }, callback)
    }

    return { setup, teardown }
  }
}

function createAsync (options = {}) {
  return () => {
    const nodes = []
    const setup = async (setupOptions = {}) => {
      const ipfsFactory = IPFSFactory.create(merge(
        options.factoryOptions ? {} : { ...DEFAULT_FACTORY_OPTIONS },
        setupOptions.factoryOptions,
        options.factoryOptions
      ))
      const node = await ipfsFactory.spawn(merge(
        setupOptions.spawnOptions,
        options.spawnOptions || { initOptions: { profile: 'test' } }
      ))
      nodes.push(node)

      const id = await node.api.id()
      node.api.peerId = id

      return node.api
    }

    const teardown = () => {
      return Promise.all(nodes.map(n => n.stop()))
    }
    return {
      setup,
      teardown
    }
  }
}
module.exports = {
  createAsync,
  create: createFactory
}
