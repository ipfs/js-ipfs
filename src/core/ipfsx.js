'use strict'

const log = require('debug')('ipfs')
const mergeOptions = require('merge-options')
const { isTest } = require('ipfs-utils/src/env')
const { NotInitializedError } = require('./errors')
const { validate } = require('./config')
const Components = require('./components-ipfsx')
const ApiManager = require('./api-manager')

const getDefaultOptions = () => ({
  init: true,
  start: true,
  EXPERIMENTAL: {},
  preload: {
    enabled: !isTest, // preload by default, unless in test env
    addresses: [
      '/dns4/node0.preload.ipfs.io/https',
      '/dns4/node1.preload.ipfs.io/https'
    ]
  }
})

module.exports = async options => {
  options = mergeOptions(getDefaultOptions(), validate(options || {}))

  // eslint-disable-next-line no-console
  const print = options.silent ? log : console.log

  const apiManager = new ApiManager()
  const init = Components.init({ apiManager, print, constructorOptions: options })
  const { api } = apiManager.update({ init }, () => { throw new NotInitializedError() })

  if (!options.init) {
    return api
  }

  await api.init()

  if (!options.start) {
    return api
  }

  return api.start()
}
