'use strict'

const gulp = require('gulp')

require('./daemons')

gulp.task('test:node:before', ['daemons:start'])
gulp.task('test:node:after', ['daemons:stop'])
gulp.task('test:browser:before', ['daemons:start'])
gulp.task('test:browser:after', ['daemons:stop'])
