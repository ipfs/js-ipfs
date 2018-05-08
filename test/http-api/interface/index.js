/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')

describe.only('## interface-ipfs-core over ipfs-api', () => {
  fs.readdirSync(path.join(__dirname))
    .forEach((file) => file !== 'index.js' && require(`./${file}`))
})
