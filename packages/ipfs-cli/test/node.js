/* eslint-env mocha */
'use strict'

const fs = require('fs')

describe('cli', () => {
  fs.readdirSync(__dirname)
    .filter((file) => file !== 'node.js' && file !== 'utils')
    .forEach((file) => require('./' + file))
})
