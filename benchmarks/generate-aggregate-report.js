'use strict'

const concat = require('concat-stream')
const handlebars = require('handlebars')
const fs = require('fs')
const join = require('path').join
const open = require('opn')

const template = handlebars.compile(
  fs.readFileSync(join(__dirname, 'report-templates', 'aggregate.html'), 'utf8'))

process.stdin.pipe(concat(gotResult))

function gotResult(str) {
  outputSuites(JSON.parse(str))
}

function outputSuites(suites) {
  const html = template({ suites: suites })
  const outPath = join(__dirname, 'reports', 'aggregate.html')
  fs.writeFileSync(outPath, html)
  // console.log(html)
  // return;

  console.log('Aggregate report written to %s', outPath)
  open(outPath, { wait: false })
}
