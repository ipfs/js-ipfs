'use strict'

const gulp = require('gulp')
const runSequence = require('run-sequence')

require('require-dir')('tasks')

gulp.task('default', (done) => {
  runSequence(
    'lint',
    'test',
    done
  )
})

// Workaround for gulp not exiting after calling done
// See https://github.com/gulpjs/gulp/issues/167
//
// The issue for this is that the daemon start seems to keep
// some open connections that are not cleaned up properly and so
// gulp does not exit. So it's probably a bug in node-ipfs-ctl
gulp.on('stop', () => {
  process.nextTick(() => {
    process.exit()
  })
})
