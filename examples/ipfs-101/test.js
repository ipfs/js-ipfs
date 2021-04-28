'use strict'

const path = require('path')
const {
  waitForOutput
} = require('test-ipfs-example/utils')

async function runTest () {
  await waitForOutput('Added file contents: Hello World 101', path.resolve(__dirname, '1.js'))
}

module.exports = runTest
