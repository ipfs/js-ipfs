'use strict'

const spawn = require('child_process').spawn
const split = require('split')

module.exports = profile

function profile (suites, callback) {
  const args = [process.argv[0], __dirname].concat(suites)

  const options = {
    stdio: 'pipe'
  }
  const child = spawn('0x', args, options)
  let lastLine = ''
  let error

  child.stdout.pipe(process.stdout)
  child.stderr.pipe(split())
    .on('data', (line) => {
      if (line) {
        lastLine = line
      }
    })
    .once('end', () => {
      if (!error) {
        const matched = lastLine.match(/file:\/\/.*\/flamegraph.html/)
        if (matched) {
          callback(null, matched[0])
        } else {
          callback(new Error('0x unexpected output:\n' + lastLine))
        }
      }
    })
    .once('error', (err) => {
      error = err
      callback(err)
    })
}
