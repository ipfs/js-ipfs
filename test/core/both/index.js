/* eslint-env mocha */
'use strict'

const fs = require('fs')

describe('--both', () => {
  const tests = fs.readdirSync(__dirname)

  tests.filter((file) => {
    return !(file === 'index.js' || file.indexOf('.') === 0)
  }).forEach((file) => {
    require('./' + file)
  })
})
