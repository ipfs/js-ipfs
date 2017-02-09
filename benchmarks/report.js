'use strict'

const join = require('path').join
const exec = require('child_process').exec
const open = require('opn')

const outDir = join(__dirname, 'reports', 'out')
const out = join(outDir, Date.now() + '-report.html')
const command = 'node benchmarks | node benchmarks/generate-report > ' + out
const child = exec(command)
child.stderr.pipe(process.stderr)
child.once('exit', (code, signal) => {
  if (code === 0) {
    process.stderr.write('Report generated to ' + out + '\n')
    open(out, { wait: false })
  }
})