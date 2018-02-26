/* eslint-env mocha */
'use strict'

const fs = require('fs')
const path = require('path')

describe('## extra tests with ipfs-api', () => {
  fs.readdirSync(path.join(__dirname))
    .forEach((file) => {
      // TODO(victor) want to make all this loading of tests proper, but for now
      if (file.includes('utils') || file.includes('index.js')) {
        return
      }
      require(`./${file}`)
    })
})
