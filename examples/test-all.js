'use strict'

process.on('unhandedRejection', (err) => {
  console.error(err)

  process.exit(1)
})

const path = require('path')
const fs = require('fs')
const {
  waitForOutput
} = require('./utils')

async function testAll () {
  for (const dir of fs.readdirSync(__dirname)) {
    if (dir === 'node_modules' || dir === 'tests_output') {
      continue
    }

    const stats = fs.statSync(path.join(__dirname, dir))

    if (!stats.isDirectory()) {
      continue
    }

    await waitForOutput('npm info ok', 'npm', ['test', '--', dir], {
      cwd: __dirname
    })
  }
}

testAll()
