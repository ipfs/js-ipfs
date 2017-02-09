'use strict'

const spawn = require('child_process').spawn
const split = require('split')
const url = require('url')
const path = require('path')

module.exports = profile

function profile (outDir, suites, callback) {
  const args = ['--output-dir', outDir].concat([process.argv[0], __dirname].concat(suites))

  const options = {
    // stdio: 'pipe'
  }
  const child = spawn('0x', args, options)
  let lastLine = ''
  let error
  let errorOut = ''

  child.stderr.pipe(split())
    .on('data', (line) => {
      if (line) {
        lastLine = line
        errorOut += line + '\n'
      }
    })
    .once('end', () => {
      if (!error) {
        const matched = lastLine.match(/file:\/\/.*\/flamegraph.html/)
        if (matched) {
          const resultPath = url.parse(matched[0].replace('file://', 'file:///')).pathname
          callback(null, path.relative(outDir, resultPath))
        } else {
          callback(new Error('0x unexpected output:\n' + errorOut))
        }
      }
    })
    .once('error', (err) => {
      error = err
      callback(err)
    })
}
