'use strict'

const configure = require('../lib/configure')
const globSource = require('ipfs-utils/src/files/glob-source')

module.exports = configure(({ ky }) => {
  const add = require('../add')({ ky })
  return (path, options) => add(globSource(path, options), options)
})
