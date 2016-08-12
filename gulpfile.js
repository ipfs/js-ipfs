'use strict'

const gulp = require('gulp')

require('./test/setup/spawn-daemons')
require('./test/factory/factory-tasks')

gulp.task('test:node:before', ['daemons:start', 'factory:start'])
gulp.task('test:node:after', ['daemons:stop', 'factory:stop'])
gulp.task('test:browser:before', ['daemons:start', 'factory:start'])
gulp.task('test:browser:after', ['daemons:stop', 'factory:stop'])

require('aegir/gulp')(gulp)
