'use strict'

const profiler = require('./profiler')

const suites = process.argv.slice(2)

profiler(suites, (err, resultLink) => {
  if (err) {
    throw err
  }
  console.log(resultLink)
})
