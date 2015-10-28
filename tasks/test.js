var gulp = require('gulp')
var Server = require('karma').Server
var $ = require('gulp-load-plugins')()
var runSequence = require('run-sequence')

require('./daemons')

gulp.task('test', function (done) {
  runSequence(
    'test:node',
    // 'test:browser',
    done
  )
})

gulp.task('test:node', function (done) {
  runSequence(
    'daemons:start',
    'mocha',
    'daemons:stop',
    done
  )
})

gulp.task('test:browser', function (done) {
  runSequence(
    'daemons:start',
    'karma',
    'daemons:stop',
    done
  )
})

gulp.task('mocha', function () {
  return gulp.src('test/tests.js')
    .pipe($.mocha())
})

gulp.task('karma', function (done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js',
    singleRun: true
  }, done).start()
})
