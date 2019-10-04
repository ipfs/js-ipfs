'use strict'

const globSource = require('ipfs-utils/src/files/glob-source')

module.exports = (config) => {
  const add = require('../add')(config)
  return (path, options) => add(globSource(path, options), options)
}
