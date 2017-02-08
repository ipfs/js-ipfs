'use strict'

require('colors')
const eachSeries = require('async/eachSeries')
const Suite = require('benchmark').Suite

let suites = {
  'import-files': require('./import-files')
}

suites = Object.keys(suites).map((suiteName) => {
  const suite = Suite(suiteName)
  let tests = suites[suiteName]
  if (!Array.isArray(tests)) {
    tests = [tests]
  }

  tests.forEach(test => {
    suite.add(test.name, test, { defer: true })
  })

  return suite
})

eachSeries(
  suites,
  (suite, callback) => {
    suite.on('complete', () => {
      suite.forEach(printBenchmark)
      callback()
    })

    console.log(suite.name.red)
    suite.run({ async: true })
  },
  (err) => {
    if (err) {
      throw err
    }
  }
)

function printBenchmark (benchmark) {
  console.log('  ' + benchmark.name.green + ':')
  console.log('    count: %d', benchmark.count)
  console.log('    hz: %d', benchmark.hz)
  const stats = benchmark.stats
  for (let stat in stats) {
    if (stat !== 'sample') {
      console.log('    %s: %d', stat, stats[stat])
    }
  }
}
