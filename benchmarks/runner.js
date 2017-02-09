'use strict'

require('colors')
const mapSeries = require('async/mapSeries')
const Benchmark = require('benchmark')
const Suite = Benchmark.Suite
const os = require('os')

const suites = require('./suites')

exports.run = run

function run (_suites, callback) {
  const s = _suites || suites
  mapSeries(s, runOne, (err, result) => {
    if (!err) {
      process.stderr.write('all finished\n'.green)
    }
    callback(err, result)
  })
}

function runOne (_suite, callback) {
  let suite = _suite
  if (typeof suite === 'string') {
    suite = suites.find(s => s.name === suite)
    if (!suite) {
      return callback(new Error('no suite named ' + _suite))
    }
  }
  process.stderr.write((suite.name + ' started\n').yellow)

  const s = Suite(suite.name)
  let tests = suite.tests
  if (!Array.isArray(tests)) {
    tests = [tests]
  }

  tests.forEach((test, index) => {
    s.add(test.name || (suite.name + '-' + (index + 1)), test, { defer: true })
  })

  s.on('complete', () => {
    process.stderr.write(suite.name + ' finished\n')
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
        suite: suite.name,
        code: benchmark.fn.toString(),
        platform: Benchmark.platform,
        cpus: os.cpus(),
        loadavg: os.loadavg(),
        count: benchmark.count,
        hz: benchmark.hz,
        now: Date.now(),
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
