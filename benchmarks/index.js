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

  console.log(JSON.stringify(results, null, '  '))
})
