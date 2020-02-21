/* eslint-env mocha */
'use strict'

const fs = require('fs')

describe('cli', () => {
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'index.js')
    .forEach((file) => require('./' + file))
})
