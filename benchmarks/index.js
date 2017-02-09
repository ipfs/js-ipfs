'use strict'

require('colors')
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
  // console.log(result)
  // return;
  console.log(result.name.red + ':')
  result.benchmarks.forEach(printBenchmarkResult)
}


function printBenchmarkResult (benchmark) {
  console.log('  ' + benchmark.name.green + ':')
  console.log('    count: %d', benchmark.count)
  console.log('    hz: %d', benchmark.hz)
  const stats = benchmark.stats
  for (let stat in stats) {
    console.log('    %s: %d', stat, stats[stat])
  }
}