'use strict'

const join = require('path').join
const fs = require('fs')

const reportDir = join(__dirname, 'reports', 'out')

const OK_ERRORS = ['ENOENT', 'ENOTDIR']

const reports = fs.readdirSync(reportDir)
  .map((report) => {
    const path = join(reportDir, report, 'results.json')
    try {
      return {
        path: join('out', report, 'report.html'),
        content: JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))
      }
    } catch(err) {
      if (OK_ERRORS.indexOf(err.code) > -1) {
        return null
      }
      throw err
    }
  })
  .filter(Boolean)

// console.log('reports.length:', reports.length)
// console.log('reports:', JSON.stringify(reports, null, '  '))

const suites = {}
reports.forEach((report) => {
  // console.log('report.length:', report.length)
  report.content.forEach((s) => {
    let suite = suites[s.name]
    if (!suite) {
      suite = suites[s.name] = {
        name: s.name,
        benchmarks: {}
      }
    }
    s.benchmarks.forEach((b) => {
      let benchmark = suite.benchmarks[b.name]
      if (!benchmark) {
        benchmark = suite.benchmarks[b.name] = {
          name: b.name,
          runs: []
        }
      }
      // console.log('adding run')
      benchmark.runs.push({
        when: b.now,
        path: report.path,
        whenPretty: new Date(b.now).toISOString(),
        count: b.count,
        hz: b.hz,
        stats: {
          moe: b.stats.moe,
          rme: b.stats.rme,
          sem: b.stats.sem,
          deviation: b.stats.deviation,
          mean: b.stats.mean,
          variance: b.stats.variance
        }
      })
    })
  })
})

const results = Object.keys(suites).map(sn => suites[sn]).map((suite) => {
  const benchmarks =
    Object.keys(suite.benchmarks)
      .map(bn => suite.benchmarks[bn])
      .map((bm) => {
        return {
          name: bm.name,
          runs: bm.runs.sort(sortBenchmarkRuns),
          colors: {
            mean: '#3772FF',
            variance: '#EF709D',
            deviation: '#E2EF70',
            MOE: '#CA3CFF',
            RME: '#70E4EF',
            SEM: '#DEF6CA',
            count: '#F8BDC4',
            hz: '#F497DA'
          },
          metric: bm.runs.sort(sortBenchmarkRuns).reduce(reduceBenchmarkRuns, {
            mean: [],
            variance: [],
            deviation: [],
            MOE: [],
            RME: [],
            SEM: [],
            count: [],
            hz: []
          })
        }
      })
  // const runs = benchmarks.runs.forEach()
  const s = {
    suite: suite.name,
    benchmarks: benchmarks
  }

  return s
})

const viewPath = join(__dirname, 'reports', 'views.json')

process.stdout.write(JSON.stringify(results, null, '  '))

function sortBenchmarkRuns (a, b) {
  return a.when - b.when
}

function reduceBenchmarkRuns (acc, run) {
  acc.count.push({ when: run.when, value: run.count })
  acc.hz.push({ when: run.when, value: run.hz })
  acc.MOE.push({ when: run.when, value: run.stats.moe })
  acc.RME.push({ when: run.when, value: run.stats.rme })
  acc.SEM.push({ when: run.when, value: run.stats.sem })
  acc.deviation.push({ when: run.when, value: run.stats.deviation })
  acc.mean.push({ when: run.when, value: run.stats.mean })
  acc.variance.push({ when: run.when, value: run.stats.variance })

  return acc
}

function generateColor () {

}