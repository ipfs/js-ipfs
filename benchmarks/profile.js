'use strict'

const profiler = require('./profiler')
const argv = require('yargs').argv

const suites = argv._
const outDir = argv.out
if (!outDir) {
  throw new Error('please provide an out dir')
}

profiler(outDir, suites, (err, resultLink) => {
  if (err) {
    throw err
  }
  process.stdout.write(resultLink)
})
