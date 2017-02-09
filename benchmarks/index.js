'use strict'

const runner = require('./runner')

let suites = process.argv.slice(2)

if (!suites.length) {
  suites = undefined
}

runner.run(suites, (err, results) => {
  if (err) {
    throw err
  }

  results.forEach(printSuiteResult)
})

function printSuiteResult (result) {
  console.log(JSON.stringify(result, null, '  '))
}
