/* eslint-env mocha, browser */
'use strict'

const { createSuite } = require('interface-ipfs-core/src/utils/suite')

exports.core = createSuite({
  add: require('interface-ipfs-core/src/add'),
  cat: require('interface-ipfs-core/src/cat')
})
