'use strict'

const path = require('path')
const execa = require('execa')
const fs = require('fs')

async function test () {
  const proc = execa('node', [ path.join(__dirname, 'index.js') ], {
    cwd: path.resolve(__dirname)
  })
  proc.all.on('data', (data) => {
    process.stdout.write(data)
  })

  await proc

  if (!fs.existsSync('/tmp/custom-repo/.ipfs')) {
    throw new Error('Custom repo was not created at /tmp/custom-repo/.ipfs')
  }
}

module.exports = test
