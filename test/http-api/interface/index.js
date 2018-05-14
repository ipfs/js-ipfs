/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')

describe('## interface-ipfs-core over ipfs-api', () => {
  fs.readdirSync(path.join(__dirname))
    .forEach((file) => file !== 'index.js' && require(`./${file}`))
})
