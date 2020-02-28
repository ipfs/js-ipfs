'use strict'

const {
  waitForOutput
} = require('test-ipfs-example/utils')

async function runTest () {
  await waitForOutput('protocolVersion', 'npm', ['run', 'start'], {
    cwd: __dirname
  })
  console.info('all done')
  process.exit(0)
}

module.exports = runTest
