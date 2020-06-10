/* eslint-env mocha, browser */
'use strict'

const tests = require('interface-ipfs-core')
const { activate } = require('./util/client')

describe('interface-ipfs-core tests', () => {
  const commonFactory = {
    spawn () {
      return { api: activate() }
    },
    clean () {}
  }

  tests.dag(commonFactory)
})
