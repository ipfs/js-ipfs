'use strict'

const concat = require('concat-stream')
const handlebars = require('handlebars')
const fs = require('fs')
const join = require('path').join
const template = handlebars.compile(
  fs.readFileSync(join(__dirname, 'report-templates', 'views.html'), 'utf8'))

process.stdin.pipe(concat(gotResult))

function gotResult(str) {
  outputSuites(JSON.parse(str))
}

function outputSuites(suites) {
  const html = template({ suites: suites })
  process.stdout.write(html)
}
