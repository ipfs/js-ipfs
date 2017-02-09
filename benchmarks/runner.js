'use strict'

const mapSeries = require('async/mapSeries')
const Suite = require('benchmark').Suite
const suites = require('./suites')

exports.run = run

function run (_suites, callback) {
  const s = _suites || suites
  mapSeries(s, runOne, callback)
}

function runOne (_suite, callback) {
  let suite = _suite
  if (typeof suite === 'string') {
    suite = suites.find(s => s.name === suite)
    if (!suite) {
      return callback(new Error('no suite named ' + _suite))
    }
  }
  const s = Suite(suite.name)
  let tests = suite.tests
  if (!Array.isArray(tests)) {
    tests = [tests]
  }

  tests.forEach(test => {
    s.add(test.name, test, { defer: true })
  })

  s.on('complete', () => {
    callback(null, result(s))
  })

  s.run({ async: true })
}

function result (suite) {
  // console.log(suite)
  return {
    name: suite.name,
    benchmarks: suite.map(benchmark => {
      return {
        name: benchmark.name,
        count: benchmark.count,
        hz: benchmark.hz,
        stats: {
          moe: benchmark.stats.moe,
          rme: benchmark.stats.rme,
          sem: benchmark.stats.sem,
          deviation: benchmark.stats.deviation,
          mean: benchmark.stats.mean,
          variance: benchmark.stats.variance
        }
      }
    })
  }
}