'use strict'

const {
  waitForOutput
} = require('test-ipfs-example/utils')

async function runTest () {
  await waitForOutput('protocolVersion', 'npm', ['run', 'start'], {
    cwd: __dirname
  })
}

module.exports = runTest
