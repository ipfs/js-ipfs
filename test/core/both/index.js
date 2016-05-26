/* eslint-env mocha */
'use strict'

const fs = require('fs')

describe('--both', () => {
  const tests = fs.readdirSync(__dirname)

  tests.filter((file) => {
    if (file === 'index.js') {
      return false
    } else {
      return true
    }
  }).forEach((file) => {
    require('./' + file)
  })
})
